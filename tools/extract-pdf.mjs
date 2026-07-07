import { readFile, writeFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error('Usage: node tools/extract-pdf.mjs input.pdf output.txt');
  process.exit(1);
}

const buffer = await readFile(input);
const parser = new PDFParse({ data: buffer });
const data = await parser.getText();
await parser.destroy();
await writeFile(output, data.text, 'utf8');

console.log(`Extracted ${data.total} pages and ${data.text.length} characters to ${output}`);
