import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class JsonStore {
  constructor(filePath, defaultValue) {
    this.filePath = filePath;
    this.defaultValue = defaultValue;
    this.queue = Promise.resolve();
  }
  async init() {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try { await readFile(this.filePath, 'utf8'); }
    catch { await writeFile(this.filePath, JSON.stringify(this.defaultValue, null, 2), 'utf8'); }
  }
  async read() {
    await this.init();
    const raw = await readFile(this.filePath, 'utf8');
    return JSON.parse(raw);
  }
  async write(value) {
    await this.init();
    await writeFile(this.filePath, JSON.stringify(value, null, 2), 'utf8');
    return value;
  }
  async update(mutator) {
    this.queue = this.queue.then(async () => {
      const current = await this.read();
      const next = await mutator(structuredClone(current));
      await this.write(next);
      return next;
    });
    return this.queue;
  }
}
