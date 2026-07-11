import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { LatexCompilationError, LatexEngineNotFoundError } from "./errors";

/** Mirrors src/lib/latex/compile.ts in the main app verbatim (see that file
 * for the detailed reasoning behind each design decision — sanitized PATH,
 * dropping -halt-on-error, judging success by PDF existence, etc.). */

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

function extractPageCount(log: string): number {
  const match = log.match(/Output written on[\s\S]*?\((\d+) pages?(?:,[^)]*)?\)/);
  return match ? Number(match[1]) : 0;
}

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
        `${binary} was not found. Ensure a XeTeX-capable TeX Live install is on the server and LATEX_PATH is set if it is not on PATH.`
      );
    }
  }

  const log = await fs.readFile(path.join(workDir, "resume.log"), "utf-8").catch(() => "");

  const pdfExists = await fs
    .access(path.join(workDir, "resume.pdf"))
    .then(() => true)
    .catch(() => false);

  return { success: pdfExists, log };
}

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
