import path from "node:path";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";

let workerReady = false;

/** pdf-parse v2 needs an explicit worker path when bundled by Next.js/Turbopack */
function ensurePdfWorker() {
  if (workerReady) return;
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  );
  PDFParse.setWorker(pathToFileURL(workerPath).href);
  workerReady = true;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  ensurePdfWorker();
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}
