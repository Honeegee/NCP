/* eslint-disable @typescript-eslint/no-require-imports */

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ verbosity: 0, data: buffer });
  await parser.load();
  const result = await parser.getText();
  return normalizeText(result.text);
}

/** Extract text from .docx files (Office Open XML / zip-based) */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return normalizeText(result.value);
}

/** Extract text from .doc files (old binary OLE2 format) */
export async function extractTextFromDoc(buffer: Buffer): Promise<string> {
  const WordExtractor = require("word-extractor");
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  return normalizeText(doc.getBody());
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
