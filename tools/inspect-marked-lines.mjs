import { readFile } from 'node:fs/promises';

const text = await readFile('tcm26-extracted.txt', 'utf8');
const lines = text.split(/\r?\n/);
const marked = /DEPART|ARRIVEE|PC\d?|PM\s?\d?|RAVITO|KMS?|FIN|DEBUT/i;

for (const [index, line] of lines.entries()) {
  if (marked.test(line) && /(\d+:\d+|\d+,\d+)/.test(line)) {
    console.log(`${index + 1}: ${line}`);
  }
}
