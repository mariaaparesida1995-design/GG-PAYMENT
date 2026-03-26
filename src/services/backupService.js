import { jsonBuffer } from '../utils/files.js';

export class BackupService {
  constructor(repositories) { this.repositories = repositories; }
  async exportGuild(guildId) {
    const [config, products, panels, orders, tickets, warns] = await Promise.all([
      this.repositories.config.get(guildId), this.repositories.products.listByGuild(guildId), this.repositories.panels.listByGuild(guildId), this.repositories.orders.listByGuild(guildId), this.repositories.tickets.listByGuild(guildId), this.repositories.warns.listByGuild(guildId),
    ]);
    return { exportedAt: new Date().toISOString(), guildId, data: { config, products, panels, orders, tickets, warns } };
  }
  async restoreGuild(guildId, payload) {
    const data = payload.data ?? payload; if (!data.config) throw new Error('Backup inválido: config ausente.');
    await this.repositories.config.set(guildId, { ...data.config, guildId });
    const replaceCollection = async (repo, incoming = []) => {
      const current = await repo.all(); const others = current.filter((item) => item.guildId !== guildId);
      await repo.store.write([...others, ...incoming.map((item) => ({ ...item, guildId }))]);
    };
    await replaceCollection(this.repositories.products, data.products);
    await replaceCollection(this.repositories.panels, data.panels);
    await replaceCollection(this.repositories.orders, data.orders);
    await replaceCollection(this.repositories.tickets, data.tickets);
    await replaceCollection(this.repositories.warns, data.warns);
  }
  buildAttachment(payload) { return { name: `backup-${payload.guildId}.json`, data: jsonBuffer(payload) }; }
}

