import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";

import { LatexCompilationError, LatexEngineNotFoundError, LatexTemplateError } from "./errors";
import { compileResumeWithPageFit } from "./page-fit";
import { compileRequestSchema } from "./schema";

const PORT = Number(process.env.PORT) || 3001;
const COMPILE_SECRET = process.env.COMPILE_SECRET;

if (!COMPILE_SECRET) {
  console.error("COMPILE_SECRET is not set. Refusing to start: the /compile endpoint would be unauthenticated.");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const provided = req.header("x-api-key");
  if (provided !== COMPILE_SECRET) {
    res.status(401).json({ error: "Invalid or missing X-Api-Key header." });
    return;
  }
  next();
}

app.post("/compile", requireApiKey, async (req, res) => {
  try {
    const { content, templateId, onePage } = compileRequestSchema.parse(req.body);
    const result = await compileResumeWithPageFit(content, templateId, onePage);
    res.json({
      pdfBase64: result.pdf.toString("base64"),
      tex: result.tex,
      pageCount: result.pageCount,
      fitsOnePage: result.fitsOnePage,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid request body.", details: error.flatten() });
      return;
    }
    if (error instanceof LatexTemplateError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof LatexEngineNotFoundError) {
      res.status(503).json({ error: error.message });
      return;
    }
    if (error instanceof LatexCompilationError) {
      res.status(422).json({ error: `We couldn't compile this resume to PDF: ${error.message}` });
      return;
    }
    console.error("Unhandled /compile error:", error);
    res.status(500).json({ error: "Something went wrong compiling this resume." });
  }
});

app.listen(PORT, () => {
  console.log(`latex-service listening on port ${PORT}`);
});
