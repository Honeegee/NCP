// Test script to parse resume samples
// Run with: npx tsx test-parse-samples.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplesDir = join(__dirname, "public", "resume_samples");

// Dynamically import the TS modules (tsx will handle compilation)
async function main() {
  // Use dynamic imports so tsx resolves them as TS
  const resumeParser = await import("./src/lib/resume-parser.ts");
  const dataExtractor = await import("./src/lib/data-extractor.ts");

  const { extractTextFromDoc, extractTextFromDocx } = resumeParser;
  const { extractResumeData } = dataExtractor;

  const files = [
    { name: "62069220-Nurse-Resume.doc", extractor: extractTextFromDoc },
    { name: "98539636-CV-28Staff-Nurse-29.docx", extractor: extractTextFromDocx },
  ];

  for (const file of files) {
    const filePath = join(samplesDir, file.name);
    console.log("=".repeat(80));
    console.log(`FILE: ${file.name}`);
    console.log("=".repeat(80));

    const buffer = readFileSync(filePath);

    // Extract raw text
    console.log("\n--- RAW EXTRACTED TEXT (first 3000 chars) ---\n");
    const rawText = await file.extractor(buffer);
    console.log(rawText.substring(0, 3000));
    console.log(`\n[Total raw text length: ${rawText.length} chars]`);

    // Parse structured data
    console.log("\n--- PARSED STRUCTURED DATA ---\n");
    const parsed = extractResumeData(rawText);
    console.log(JSON.stringify(parsed, null, 2));

    console.log("\n");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
