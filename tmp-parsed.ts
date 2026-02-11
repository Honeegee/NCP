import { readFileSync } from "fs";
import { join } from "path";
import { extractTextFromDoc, extractTextFromDocx, extractTextFromPDF } from "./src/lib/resume-parser";
import { extractResumeDataHybrid } from "./src/lib/data-extractor";

// Load .env.local so GOOGLE_AI_API_KEY is available
const envContent = readFileSync(join(__dirname, ".env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) process.env[match[1]] = match[2].trim();
}

async function main() {
  const samplesDir = join(__dirname, "public", "resume_samples");

  const files = [
    // { name: "62069220-Nurse-Resume.doc", extractor: extractTextFromDoc },
    // { name: "98539636-CV-28Staff-Nurse-29.docx", extractor: extractTextFromDocx },
    { name: "Nursing Resume Example.pdf", extractor: extractTextFromPDF },
    // { name: "Med-Surg-Nurse-Resume.pdf", extractor: extractTextFromPDF },
    // { name: "Graduate-Resume-Example-Nursing.pdf", extractor: extractTextFromPDF },
  ];

  for (const file of files) {
    console.log("=".repeat(80));
    console.log(`FILE: ${file.name}`);
    console.log("=".repeat(80));

    const buffer = readFileSync(join(samplesDir, file.name));
    const text = await file.extractor(buffer);

    console.log("\n--- EXTRACTED TEXT ---\n");
    console.log(text);

    console.log("\n--- PARSED DATA (JSON) ---\n");
    const parsedData = await extractResumeDataHybrid(text);
    console.log(JSON.stringify(parsedData, null, 2));
    console.log("\n");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
