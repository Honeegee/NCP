import fs from 'fs';
import path from 'path';

// Import using relative paths (not @/ aliases)
import { extractTextFromDoc, extractTextFromDocx } from './src/lib/resume-parser';

async function main() {
  const samplesDir = path.join(process.cwd(), 'public', 'resume_samples');
  
  // File 1: .doc
  const docPath = path.join(samplesDir, '62069220-Nurse-Resume.doc');
  const docBuffer = fs.readFileSync(docPath);
  const docText = await extractTextFromDoc(docBuffer);
  
  console.log('='.repeat(80));
  console.log('FILE 1: 62069220-Nurse-Resume.doc');
  console.log('='.repeat(80));
  docText.split('\n').forEach((line, i) => {
    console.log(`${String(i + 1).padStart(4)}: ${line}`);
  });
  
  console.log('\n\n');
  
  // File 2: .docx
  const docxPath = path.join(samplesDir, '98539636-CV-28Staff-Nurse-29.docx');
  const docxBuffer = fs.readFileSync(docxPath);
  const docxText = await extractTextFromDocx(docxBuffer);
  
  console.log('='.repeat(80));
  console.log('FILE 2: 98539636-CV-28Staff-Nurse-29.docx');
  console.log('='.repeat(80));
  docxText.split('\n').forEach((line, i) => {
    console.log(`${String(i + 1).padStart(4)}: ${line}`);
  });
}

main().catch(console.error);
