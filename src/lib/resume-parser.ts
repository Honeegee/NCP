/* eslint-disable @typescript-eslint/no-require-imports */

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = require("pdf-parse");
  // Handle both CommonJS default export and named export
  const parse = pdfParse.default || pdfParse;
  const data = await parse(buffer);
  return normalizeText(data.text);
}

/** Extract text from .docx files (Office Open XML / zip-based) */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = require("mammoth");

  // Use convertToHtml to preserve structure, then convert to plain text
  // This better preserves line breaks and paragraph structure
  const htmlResult = await mammoth.convertToHtml({ buffer });

  // Convert HTML to plain text while preserving line breaks
  let text = htmlResult.value
    .replace(/<br\s*\/?>/gi, '\n')           // Convert <br> to newline
    .replace(/<\/p>/gi, '\n\n')              // Convert </p> to double newline
    .replace(/<p[^>]*>/gi, '')               // Remove <p> tags
    .replace(/<\/li>/gi, '\n')               // Convert </li> to newline
    .replace(/<li[^>]*>/gi, '• ')            // Convert <li> to bullet
    .replace(/<\/div>/gi, '\n')              // Convert </div> to newline
    .replace(/<div[^>]*>/gi, '')             // Remove <div> tags
    .replace(/<\/h[1-6]>/gi, '\n\n')         // Convert heading closes to double newline
    .replace(/<h[1-6][^>]*>/gi, '')          // Remove heading tags
    .replace(/<[^>]+>/g, '')                 // Remove all other HTML tags
    .replace(/&nbsp;/g, ' ')                 // Replace &nbsp; with space
    .replace(/&amp;/g, '&')                  // Replace &amp; with &
    .replace(/&lt;/g, '<')                   // Replace &lt; with <
    .replace(/&gt;/g, '>')                   // Replace &gt; with >
    .replace(/&quot;/g, '"');                // Replace &quot; with "

  return normalizeText(text);
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
