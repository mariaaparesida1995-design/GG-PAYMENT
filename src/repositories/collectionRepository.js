import path from 'node:path';
import { JsonStore } from '../lib/jsonStore.js';
import { dataDir } from '../utils/paths.js';

export class CollectionRepository {
  constructor(fileName) { this.store = new JsonStore(path.join(dataDir, fileName), []); }
  async all() { return this.store.read(); }
  async listByGuild(guildId) { const all = await this.store.read(); return all.filter((item) => item.guildId === guildId); }
  async getById(id) { const all = await this.store.read(); return all.find((item) => item.id === id) ?? null; }
  async create(entity) { return this.store.update((all) => { all.push(entity); return all; }); }
  async update(id, patcher) {
    return this.store.update((all) => {
      const index = all.findIndex((item) => item.id === id);
      if (index === -1) return all;
      const current = structuredClone(all[index]);
      all[index] = typeof patcher === 'function' ? patcher(current) : { ...current, ...patcher };
      return all;
    });
  }
  async delete(id) { return this.store.update((all) => all.filter((item) => item.id !== id)); }
  async filter(predicate) { const all = await this.store.read(); return all.filter(predicate); }
}

