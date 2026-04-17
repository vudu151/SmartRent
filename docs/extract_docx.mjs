import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Use dynamic import for mammoth from npx cache
const mammothPath = process.argv[2];
const docxPath = 'd:\\Documents\\SmartRent\\docs\\08. Bo Bai Tap - GHEP - final_20250815.docx';
const outPath = 'd:\\Documents\\SmartRent\\docs\\template_out.md';

async function main() {
  const mammoth = await import('mammoth');
  const result = await mammoth.default.convertToMarkdown({path: docxPath});
  writeFileSync(outPath, result.value, 'utf8');
  console.log('Done, length:', result.value.length);
}
main().catch(console.error);
