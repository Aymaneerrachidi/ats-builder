import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { LatexCompilationError, LatexEngineNotFoundError } from "@/lib/errors";

export { LatexCompilationError, LatexEngineNotFoundError };

const execFileAsync = promisify(execFile);

const COMPILE_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 2;

export interface CompileResult {
  pdf: Buffer;
  log: string;
  pageCount: number;
}

function resolveLatexBinary(): string {
  const configured = process.env.LATEX_PATH?.trim();
  return configured || "xelatex";
}

/** Some environments have a PATH entry that points directly at a file
 * (e.g. a CLI tool installed as `.../bin/some-tool.exe` on PATH rather than
 * a directory containing it) rather than a directory. MiKTeX's directory
 * scanner (used when building/updating XeLaTeX's format or font cache)
 * calls a directory-attributes check on every PATH entry and hard-crashes
 * on a non-directory entry. Filtering those out for the LaTeX subprocess
 * only (never mutating the real process/environment PATH) sidesteps that
 * without depending on the user's system PATH being "clean". */
async function sanitizedPathEnv(): Promise<NodeJS.ProcessEnv> {
  const rawPath = process.env.PATH || process.env.Path || "";
  const entries = rawPath.split(path.delimiter).filter(Boolean);

  const checked = await Promise.all(
    entries.map(async (entry) => {
      try {
        const stat = await fs.stat(entry);
        return stat.isDirectory() ? entry : null;
      } catch {
        return null;
      }
    })
  );

  return { ...process.env, PATH: checked.filter(Boolean).join(path.delimiter) };
}

/** Extracts a short, human-readable message from a LaTeX log by finding the
 * first "! " error line and the following couple of context lines that
 * LaTeX prints (e.g. the offending source line). Falls back to a generic
 * message if no recognizable error marker is found (e.g. the process was
 * killed by the timeout before producing one). */
function extractFriendlyError(log: string): string {
  const lines = log.split(/\r?\n/);
  const errorIndex = lines.findIndex((line) => line.startsWith("! "));
  if (errorIndex === -1) {
    return "LaTeX compilation failed for an unknown reason. Check the compilation log for details.";
  }

  const errorLine = lines[errorIndex].replace(/^!\s*/, "");
  const contextLines = lines
    .slice(errorIndex + 1, errorIndex + 4)
    .filter((line) => line.trim().length > 0 && !line.startsWith("!"));

  const context = contextLines.join(" ").trim();
  return context ? `${errorLine} (${context})` : errorLine;
}

/** Parses the page count from LaTeX's own "Output written on resume.pdf (N
 * page(s))" summary line — the authoritative source, rather than re-parsing
 * the PDF ourselves. Returns 0 if the log doesn't contain that line (e.g.
 * compilation failed before producing output). */
function extractPageCount(log: string): number {
  // e.g. "Output written on resume.pdf (1 page, 116327 bytes)." — the byte
  // count (and its preceding comma) isn't always present, so it's optional.
  // LaTeX wraps long log lines (a long temp path pushes "(N page)" onto the
  // next line), so `[\s\S]` is used instead of `.` to bridge the newline.
  const match = log.match(/Output written on[\s\S]*?\((\d+) pages?(?:,[^)]*)?\)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Runs the LaTeX engine once and reports success based on whether it
 * actually produced a PDF — not its exit code. TeX's `-interaction=nonstopmode`
 * frequently exits non-zero (and some packages emit genuinely recoverable
 * "! Undefined control sequence" noise, e.g. a known cosmetic bug in the
 * `bidi` package's article-class compatibility file) while still writing a
 * perfectly usable PDF. `-halt-on-error` was deliberately dropped: it stops
 * the run at the first such recoverable error — often before any output is
 * written at all — turning harmless warnings into total failures.
 */
async function runLatexOnce(
  workDir: string,
  texFileName: string,
  env: NodeJS.ProcessEnv
): Promise<{ success: boolean; log: string }> {
  const binary = resolveLatexBinary();

  try {
    await execFileAsync(
      binary,
      ["-interaction=nonstopmode", "-no-shell-escape", `-output-directory=${workDir}`, texFileName],
      {
        cwd: workDir,
        env,
        timeout: COMPILE_TIMEOUT_MS,
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      }
    );
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "ENOENT") {
      throw new LatexEngineNotFoundError(
        `${binary} was not found. Ensure a XeTeX-capable TeX Live/MiKTeX install is on the server and LATEX_PATH is set if it is not on PATH.`
      );
    }
    // Any other failure (non-zero exit, timeout, ...) is fine to swallow
    // here — success is judged below by whether a PDF actually exists, and
    // the .log file (read regardless of outcome) carries the real detail.
  }

  // The .log file is the authoritative transcript regardless of how much of
  // stdout/stderr the child process actually flushed before exiting.
  const log = await fs.readFile(path.join(workDir, "resume.log"), "utf-8").catch(() => "");

  const pdfExists = await fs
    .access(path.join(workDir, "resume.pdf"))
    .then(() => true)
    .catch(() => false);

  return { success: pdfExists, log };
}

/** Compiles a LaTeX source string to a PDF using the system `xelatex`
 * binary (XeLaTeX rather than pdflatex so resumes can contain non-Latin
 * script text — Arabic, etc. — via bundled fonts; see /fonts and
 * templates/README.md). Runs in an isolated temp directory (never the
 * process cwd or a user-supplied path) and passes all arguments via
 * execFile (no shell), so user/AI-generated content can never reach a
 * shell for interpretation — the only files the engine ever sees are ones
 * this function wrote itself. Retries once on failure per the
 * "automatically retry" requirement, since pdflatex/MiKTeX occasionally
 * fails a first pass while fetching an on-the-fly package before
 * succeeding on the second. */
export async function compileLatexToPdf(tex: string): Promise<CompileResult> {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "ats-resume-"));
  const texFileName = "resume.tex";
  const env = await sanitizedPathEnv();

  try {
    await fs.writeFile(path.join(workDir, texFileName), tex, "utf-8");

    let lastLog = "";
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const result = await runLatexOnce(workDir, texFileName, env);
      lastLog = result.log;
      if (result.success) {
        // Run a second pass so hyperref bookmarks/positions settle, then use
        // its log (the final state) for the page count.
        const finalPass = await runLatexOnce(workDir, texFileName, env);
        const pdf = await fs.readFile(path.join(workDir, "resume.pdf"));
        return { pdf, log: finalPass.log, pageCount: extractPageCount(finalPass.log) };
      }
    }

    throw new LatexCompilationError(extractFriendlyError(lastLog), lastLog);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
