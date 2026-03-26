import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { createId } from '../utils/ids.js';
import { money, truncate } from '../utils/format.js';

export class PanelService {
  constructor(repositories, productService) { this.repositories = repositories; this.productService = productService; }
  async create(guildId, payload) {
    const panel = { id: createId('PAN'), guildId, name: payload.name, title: payload.title || payload.name, description: payload.description || 'Selecione um produto para comprar.', channelId: payload.channelId || '', productIds: payload.productIds || [], placeholder: payload.placeholder || 'Escolha um produto', compact: Boolean(payload.compact), bannerUrl: payload.bannerUrl || '', thumbnailUrl: payload.thumbnailUrl || '', footer: payload.footer || '', gifUrl: payload.gifUrl || '', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastMessageId: '' };
    await this.repositories.panels.create(panel);
    return panel;
  }
  async update(panelId, patch) {
    await this.repositories.panels.update(panelId, (current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
    return this.repositories.panels.getById(panelId);
  }
  async remove(panelId) { return this.repositories.panels.delete(panelId); }
  async list(guildId) { const panels = await this.repositories.panels.listByGuild(guildId); return panels.sort((a, b) => a.name.localeCompare(b.name)); }
  async get(panelId) { return this.repositories.panels.getById(panelId); }
  async autocomplete(guildId, query) {
    const items = await this.list(guildId); const lowered = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lowered) || item.id.toLowerCase().includes(lowered)).slice(0, 25);
  }
  async buildMessage(guildId, panelId, visuals) {
    const panel = await this.get(panelId);
    if (!panel || panel.guildId !== guildId) throw new Error('Painel não encontrado.');
    const products = [];
    for (const productId of panel.productIds) {
      const product = await this.productService.get(productId);
      if (product && product.active && !product.hidden && !product.archived) products.push(product);
    }
    if (!products.length) throw new Error('Este painel não possui produtos ativos.');
    const embed = new EmbedBuilder().setColor(visuals.primaryColor).setTitle(panel.title).setDescription(panel.description).setFooter({ text: panel.footer || visuals.footer }).setTimestamp();
    if (panel.bannerUrl) embed.setImage(panel.bannerUrl);
    if (panel.thumbnailUrl) embed.setThumbnail(panel.thumbnailUrl);
    if (!panel.compact) {
      embed.addFields(products.slice(0, 10).map((product) => ({ name: `${product.emoji || '🛒'} ${product.name}`, value: `${truncate(product.description, 80)}
**Preço:** ${money(product.promotionalPrice || product.price)}`, inline: false })));
    }
    const select = new StringSelectMenuBuilder().setCustomId(`panel:buy:${panel.id}`).setPlaceholder(panel.placeholder || 'Escolha um produto').addOptions(products.slice(0, 25).map((product) => ({ label: product.name.slice(0, 100), value: product.id, description: truncate(`Preço ${money(product.promotionalPrice || product.price)} • ${product.category}`, 100), emoji: product.emoji?.startsWith('<') ? undefined : product.emoji })));
    const row = new ActionRowBuilder().addComponents(select);
    return { panel, embed, row, products };
  }
  async sendToChannel(guild, panelId, channelId, visuals) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) throw new Error('Canal inválido.');
    const { panel, embed, row } = await this.buildMessage(guild.id, panelId, visuals);
    const message = await channel.send({ embeds: [embed], components: [row] });
    await this.update(panel.id, { channelId, lastMessageId: message.id });
    return message;
  }
}
