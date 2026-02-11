import { readFileSync } from "fs";
import { join } from "path";
import { extractTextFromDocx } from "./src/lib/resume-parser";

// Directly import and test extractEducation
// We need to temporarily export it or replicate the logic

async function main() {
  const buf = readFileSync(join(__dirname, "public/resume_samples/98539636-CV-28Staff-Nurse-29.docx"));
  const text = await extractTextFromDocx(buf);

  // Replicate the education header match with the FIXED regex
  const educationHeaderMatch = text.match(
    /\n(EDUCATIONAL BACKGROUND|EDUCATIONAL ATTAINMENT|ACADEMIC BACKGROUND|ACADEMIC QUALIFICATIONS|EDUCATION)[\s:]*\n/i
  );

  if (!educationHeaderMatch || educationHeaderMatch.index === undefined) {
    console.log("No education header found!");
    return;
  }

  console.log("Match[0]:", JSON.stringify(educationHeaderMatch[0]));
  console.log("Match[1]:", JSON.stringify(educationHeaderMatch[1]));

  const sectionStart = educationHeaderMatch.index + educationHeaderMatch[0].length;
  const afterEducation = text.substring(sectionStart);

  // Find section end with sub-label skipping
  const rawLines = afterEducation.split("\n");
  let sectionEnd = afterEducation.length;
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line.match(/^(?:Graduate\s+Studies|Tertiary|Secondary|Elementary|College|Post[- ]?Graduate|Vocational|Primary)\s*:/i)) continue;
    const letters = line.replace(/[^a-zA-Z]/g, "");
    const upperCount = (line.match(/[A-Z]/g) || []).length;
    const upperCaseRatio = letters.length > 0 ? upperCount / letters.length : 0;
    if (line.length >= 10 && upperCaseRatio > 0.7 && line.match(/^[A-Z]/) && !line.match(/^\d/)) {
      sectionEnd = rawLines.slice(0, i).join("\n").length;
      console.log("Section end at raw line", i, ":", JSON.stringify(line));
      break;
    }
  }

  const searchText = afterEducation.substring(0, sectionEnd);
  const lines = searchText.split("\n").map((l) => l.trim()).filter(Boolean);
  console.log("\nFiltered lines (" + lines.length + "):");
  lines.forEach((l, i) => console.log(`  ${i}: ${l}`));

  // Now check BSN date extraction specifically
  const bsnIndex = lines.findIndex((l) => /Bachelor of Science in Nursing/i.test(l));
  if (bsnIndex >= 0) {
    console.log("\nBSN at index:", bsnIndex);
    for (let j = bsnIndex + 1; j < Math.min(lines.length, bsnIndex + 4); j++) {
      const cl = lines[j];
      console.log(`  j=${j}: ${JSON.stringify(cl)}`);
      const drm = cl.match(/(\d{4})\s*[-–—]\s*(?:(\d{4})|Present|Current)/i);
      console.log(`    dateRangeMatch:`, drm ? drm[0] : "null");
    }
  }
}
main().catch(console.error);
