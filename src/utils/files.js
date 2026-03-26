import { writeFile, readFile } from 'node:fs/promises';

export async function downloadJsonAttachment(attachment, fallbackName = 'import.json') {
  const response = await fetch(attachment.url);
  if (!response.ok) throw new Error(`Não foi possível baixar ${attachment.name}.`);
  const text = await response.text();
  return { name: attachment.name || fallbackName, data: JSON.parse(text) };
}
export function jsonBuffer(payload) {
  return Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
}
export async function overwriteJson(filePath, value) {
  await writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}
export async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}
