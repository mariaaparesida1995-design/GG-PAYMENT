import { EmbedBuilder } from 'discord.js';
import { shortDate } from '../utils/format.js';

export class LogService {
  constructor(repositories) { this.repositories = repositories; }
  async send(guild, type, title, fields = [], color = 0x5865f2) {
    if (!guild) return;
    const config = await this.repositories.config.get(guild.id);
    if (!config.logs.channelId) return;
    const channel = guild.channels.cache.get(config.logs.channelId);
    if (!channel?.isTextBased()) return;
    const embed = new EmbedBuilder().setColor(color).setTitle(title).addFields(fields).setFooter({ text: `Log • ${type}` }).setTimestamp();
    await channel.send({ embeds: [embed] }).catch(() => null);
  }
  async payment(guild, order, message) {
    return this.send(guild, 'payment', '💳 Atualização de pagamento', [
      { name: 'Pedido', value: order.id, inline: true },
      { name: 'Status', value: order.status, inline: true },
      { name: 'Mensagem', value: message, inline: false },
      { name: 'Data', value: shortDate(new Date()), inline: true },
    ], 0xf1c40f);
  }
  async delivery(guild, order, destination) {
    return this.send(guild, 'delivery', '📬 Entrega concluída', [
      { name: 'Pedido', value: order.id, inline: true },
      { name: 'Produto', value: order.productName, inline: true },
      { name: 'Destino', value: destination, inline: true },
    ], 0x57f287);
  }
  async stock(guild, productName, amount, action) {
    return this.send(guild, 'stock', '📦 Alteração de estoque', [
      { name: 'Produto', value: productName, inline: true },
      { name: 'Ação', value: action, inline: true },
      { name: 'Quantidade', value: String(amount), inline: true },
    ], 0x3498db);
  }
  async config(guild, title, details) { return this.send(guild, 'config', `⚙️ ${title}`, details, 0x9b59b6); }
  async moderation(guild, action, target, moderator, reason) {
    return this.send(guild, 'moderation', `🛡️ ${action}`, [
      { name: 'Alvo', value: `${target}`, inline: true },
      { name: 'Moderador', value: `${moderator}`, inline: true },
      { name: 'Motivo', value: reason || 'Não informado', inline: false },
    ], 0xed4245);
  }
}
