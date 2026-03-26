import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { projectRoot } from '../utils/paths.js';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}
export async function loadCommandModules() {
  const dir = path.join(projectRoot, 'src', 'commands');
  const files = await walk(dir);
  const modules = [];
  for (const file of files) {
    const mod = await import(`file://${file}`);
    if (mod.default?.data) modules.push(mod.default);
  }
  return modules;
}
export async function loadEventModules() {
  const dir = path.join(projectRoot, 'src', 'events');
  const files = await walk(dir);
  const modules = [];
  for (const file of files) {
    const mod = await import(`file://${file}`);
    if (mod.default?.name && mod.default?.execute) modules.push(mod.default);
  }
  return modules;
}
