import path from 'node:path';
import { JsonStore } from '../lib/jsonStore.js';
import { dataDir } from '../utils/paths.js';
import { createDefaultGuildConfig } from '../config/defaultGuildConfig.js';

export class ConfigRepository {
  constructor() { this.store = new JsonStore(path.join(dataDir, 'config.json'), {}); }
  async get(guildId) {
    const all = await this.store.read();
    if (!all[guildId]) {
      all[guildId] = createDefaultGuildConfig(guildId);
      await this.store.write(all);
    }
    return all[guildId];
  }
  async set(guildId, value) {
    return this.store.update((all) => { all[guildId] = value; return all; });
  }
  async patch(guildId, patcher) {
    return this.store.update((all) => {
      const current = all[guildId] ?? createDefaultGuildConfig(guildId);
      all[guildId] = patcher(structuredClone(current));
      return all;
    });
  }
  async all() { return this.store.read(); }
}
