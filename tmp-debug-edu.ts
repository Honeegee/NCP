import { readFileSync } from "fs";
import { join } from "path";
import { extractTextFromDocx } from "./src/lib/resume-parser";

async function main() {
  const buf = readFileSync(join(__dirname, "public/resume_samples/98539636-CV-28Staff-Nurse-29.docx"));
  const text = await extractTextFromDocx(buf);

  const educationHeaderMatch = text.match(
    /\n(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND|ACADEMIC QUALIFICATIONS)[\s:]*/i
  );
  console.log("Header match:", educationHeaderMatch?.[0].replace(/\n/g, "\\n"));

  if (educationHeaderMatch && educationHeaderMatch.index !== undefined) {
    const sectionStart = educationHeaderMatch.index + educationHeaderMatch[0].length;
    const afterEducation = text.substring(sectionStart);
    const lines = afterEducation.split("\n");
    let sectionEnd = afterEducation.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^(?:Graduate\s+Studies|Tertiary|Secondary|Elementary|College|Post[- ]?Graduate|Vocational|Primary)\s*:/i))
        continue;
      const letters = line.replace(/[^a-zA-Z]/g, "");
      const upperCount = (line.match(/[A-Z]/g) || []).length;
      const upperCaseRatio = letters.length > 0 ? upperCount / letters.length : 0;
      if (line.length >= 10 && upperCaseRatio > 0.7 && line.match(/^[A-Z]/) && !line.match(/^\d/)) {
        sectionEnd = lines.slice(0, i).join("\n").length;
        console.log("Section boundary at line", i, ":", JSON.stringify(line));
        break;
      }
    }

    const searchText = afterEducation.substring(0, sectionEnd);
    const filteredLines = searchText.split("\n").map((l) => l.trim()).filter(Boolean);
    console.log("\nFiltered education lines:");
    filteredLines.forEach((l, i) => console.log(`  ${i}: ${JSON.stringify(l)}`));
  }
}
main().catch(console.error);
