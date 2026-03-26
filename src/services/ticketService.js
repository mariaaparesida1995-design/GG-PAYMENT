import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { createId } from '../utils/ids.js';

export class TicketService {
  constructor(repositories, logService) { this.repositories = repositories; this.logService = logService; }
  async findOpenByUser(guildId, userId) {
    const tickets = await this.repositories.tickets.listByGuild(guildId);
    return tickets.find((ticket) => ticket.userId === userId && ticket.status === 'open') ?? null;
  }
  async createOrderTicket(guild, user, product, order, guildConfig) {
    const categoryId = guildConfig.tickets.categoryId;
    if (!categoryId) throw new Error('Categoria de tickets não configurada.');
    if (guildConfig.tickets.preventDuplicates) {
      const existing = await this.findOpenByUser(guild.id, user.id);
      if (existing) {
        const channel = guild.channels.cache.get(existing.channelId);
        if (channel) return { ticket: existing, channel, reused: true };
      }
    }
    const name = `${guildConfig.tickets.prefix}-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
    const channel = await guild.channels.create({
      name, type: ChannelType.GuildText, parent: categoryId,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ],
    });
    if (guildConfig.tickets.staffRoleId) {
      await channel.permissionOverwrites.create(guildConfig.tickets.staffRoleId, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, ManageMessages: true });
    }
    if (guildConfig.tickets.customerRoleId) {
      await channel.permissionOverwrites.create(guildConfig.tickets.customerRoleId, { ViewChannel: true, ReadMessageHistory: true }).catch(() => null);
    }
    const ticket = { id: createId('TICK'), guildId: guild.id, userId: user.id, channelId: channel.id, orderId: order.id, productId: product.id, status: 'open', claimedBy: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await this.repositories.tickets.create(ticket);
    const embed = new EmbedBuilder().setColor(guildConfig.visuals.primaryColor).setTitle('🎫 Ticket de compra criado').setDescription(`${guildConfig.tickets.openMessage}

**Cliente:** ${user}
**Produto:** ${product.name}
**Pedido:** ${order.id}`).setFooter({ text: guildConfig.visuals.footer }).setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`ticket:claim:${ticket.id}`).setLabel('Assumir').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`ticket:close:${ticket.id}`).setLabel('Fechar').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`ticket:transcript:${ticket.id}`).setLabel('Transcript').setStyle(ButtonStyle.Primary),
    );
    await channel.send({ content: `${user} ${guildConfig.tickets.staffRoleId ? `<@&${guildConfig.tickets.staffRoleId}>` : ''}`.trim(), embeds: [embed], components: [row] });
    await this.logService.send(guild, 'tickets', '🎫 Ticket aberto', [
      { name: 'Ticket', value: ticket.id, inline: true },
      { name: 'Pedido', value: order.id, inline: true },
      { name: 'Canal', value: `<#${channel.id}>`, inline: true },
    ], 0x5865f2);
    return { ticket, channel, reused: false };
  }
  async close(ticketId, reason = 'Não informado') {
    const ticket = await this.repositories.tickets.getById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado.');
    await this.repositories.tickets.update(ticketId, { status: 'closed', closeReason: reason, updatedAt: new Date().toISOString() });
    return this.repositories.tickets.getById(ticketId);
  }
  async reopen(ticketId) {
    const ticket = await this.repositories.tickets.getById(ticketId);
    if (!ticket) throw new Error('Ticket não encontrado.');
    await this.repositories.tickets.update(ticketId, { status: 'open', updatedAt: new Date().toISOString(), closeReason: '' });
    return this.repositories.tickets.getById(ticketId);
  }
  async claim(ticketId, userId) { await this.repositories.tickets.update(ticketId, { claimedBy: userId, updatedAt: new Date().toISOString() }); return this.repositories.tickets.getById(ticketId); }
  async get(ticketId) { return this.repositories.tickets.getById(ticketId); }
  async listByGuild(guildId) { return this.repositories.tickets.listByGuild(guildId); }
}
