import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createId } from '../utils/ids.js';
import { money } from '../utils/format.js';

export class OrderService {
  constructor(repositories, productService, paymentService, ticketService, logService) { this.repositories = repositories; this.productService = productService; this.paymentService = paymentService; this.ticketService = ticketService; this.logService = logService; }
  async createOrder(guild, user, product, guildConfig, publicBaseUrl) {
    const totalAmount = Number(product.promotionalPrice || product.price);
    const order = { id: createId('ORD'), guildId: guild.id, userId: user.id, productId: product.id, productName: product.name, totalAmount, status: 'pending', paymentStatus: 'creating', paymentProvider: '', paymentProviderId: '', deliveryStatus: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), couponCode: '', ticketId: '', history: [] };
    await this.repositories.orders.create(order);
    const { ticket, channel } = await this.ticketService.createOrderTicket(guild, user, product, order, guildConfig);
    await this.repositories.orders.update(order.id, { ticketId: ticket.id, ticketChannelId: channel.id });
    const paymentResult = await this.paymentService.createForOrder(guild, await this.repositories.orders.getById(order.id), user, product, guildConfig, publicBaseUrl);
    const freshOrder = await this.repositories.orders.getById(order.id);
    const { embed, rows } = this.paymentService.buildOrderPaymentMessage(freshOrder, guildConfig);
    const qrAttachment = this.paymentService.buildQrAttachment(freshOrder, paymentResult.payment);
    const payload = {
      embeds: [new EmbedBuilder().setColor(guildConfig.visuals.secondaryColor).setTitle(`${product.emoji || '🛒'} Pedido criado`).setDescription(`**Produto:** ${product.name}
**Valor:** ${money(totalAmount)}
**Pedido:** ${freshOrder.id}`).setFooter({ text: guildConfig.visuals.footer }).setTimestamp(), embed],
      components: rows,
      files: qrAttachment ? [qrAttachment] : [],
    };
    if (paymentResult.payment.qrText) payload.content = `\`\`\`
${paymentResult.payment.qrText}
\`\`\``;
    await channel.send(payload);
    await this.logService.send(guild, 'purchases', '🛒 Novo pedido criado', [
      { name: 'Pedido', value: freshOrder.id, inline: true },
      { name: 'Cliente', value: `<@${user.id}>`, inline: true },
      { name: 'Produto', value: product.name, inline: true },
    ], 0x57f287);
    return await this.repositories.orders.getById(order.id);
  }
  async get(orderId) { return this.repositories.orders.getById(orderId); }
  async listByGuild(guildId) { const items = await this.repositories.orders.listByGuild(guildId); return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
  async listByUser(guildId, userId) { const items = await this.repositories.orders.listByGuild(guildId); return items.filter((item) => item.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
  async approve(orderId, guild, reason = 'aprovado') { const order = await this.repositories.orders.getById(orderId); if (!order) throw new Error('Pedido não encontrado.'); await this.repositories.orders.update(orderId, { status: 'approved', paymentStatus: 'approved', updatedAt: new Date().toISOString() }); const fresh = await this.repositories.orders.getById(orderId); await this.logService.payment(guild, fresh, reason); return fresh; }
  async cancel(orderId, guild) { const order = await this.repositories.orders.getById(orderId); if (!order) throw new Error('Pedido não encontrado.'); const fresh = await this.paymentService.cancel(order); await this.logService.payment(guild, fresh, 'Cobrança cancelada.'); return fresh; }
  async deliver(orderId, guild, guildConfig) {
    const order = await this.repositories.orders.getById(orderId); if (!order) throw new Error('Pedido não encontrado.');
    const product = await this.productService.get(order.productId); if (!product) throw new Error('Produto não encontrado.');
    let deliveryContent = '';
    if (product.deliveryType === 'stock') {
      const source = await this.repositories.products.getById(product.id);
      const item = Array.isArray(source.stockItems) && source.stockItems.length ? source.stockItems.shift() : null;
      if (!item) throw new Error('Sem item em estoque para entrega.');
      deliveryContent = item;
      await this.repositories.products.update(product.id, { stock: source.unlimitedStock ? source.stock : Math.max(0, source.stock - 1), stockItems: source.stockItems, updatedAt: new Date().toISOString() });
    } else if (product.deliveryType === 'text') {
      deliveryContent = product.deliveryText || 'Entrega de texto não configurada.';
    } else {
      deliveryContent = 'Entrega manual pendente. Staff deve concluir.';
    }
    const ticketChannel = guild.channels.cache.get(order.ticketChannelId);
    const user = await guild.client.users.fetch(order.userId).catch(() => null);
    const embed = new EmbedBuilder().setColor(guildConfig.visuals.secondaryColor).setTitle('📬 Entrega do pedido').setDescription(guildConfig.tickets.deliveryMessage).addFields({ name: 'Pedido', value: order.id, inline: true }, { name: 'Produto', value: order.productName, inline: true }).setFooter({ text: guildConfig.visuals.footer }).setTimestamp();
    const deliveryFile = deliveryContent.length > 1900 ? new AttachmentBuilder(Buffer.from(deliveryContent, 'utf8'), { name: `entrega-${order.id}.txt` }) : null;
    const sendPayload = { embeds: [embed], content: deliveryFile ? undefined : `\`\`\`
${deliveryContent}
\`\`\``, files: deliveryFile ? [deliveryFile] : [] };
    if (guildConfig.payments.qrDelivery === 'dm' || guildConfig.payments.qrDelivery === 'both') await user?.send(sendPayload).catch(() => null);
    if (guildConfig.payments.qrDelivery === 'ticket' || guildConfig.payments.qrDelivery === 'both') await ticketChannel?.send(sendPayload).catch(() => null);
    await this.repositories.orders.update(orderId, { status: 'delivered', deliveryStatus: 'delivered', updatedAt: new Date().toISOString(), deliveredAt: new Date().toISOString() });
    const fresh = await this.repositories.orders.getById(orderId); await this.logService.delivery(guild, fresh, guildConfig.payments.qrDelivery);
    if (guildConfig.tickets.closeAfterDelivery && ticketChannel) {
      await ticketChannel.send('Entrega concluída. Este ticket será fechado.').catch(() => null);
      await ticketChannel.permissionOverwrites.edit(order.userId, { SendMessages: false }).catch(() => null);
    }
    return fresh;
  }
  async refreshPayment(orderId, guild) {
    const order = await this.repositories.orders.getById(orderId); if (!order) throw new Error('Pedido não encontrado.');
    const fresh = await this.paymentService.syncStatus(order);
    if (fresh.paymentStatus === 'approved' && fresh.status !== 'approved') await this.approve(orderId, guild, 'Pagamento aprovado automaticamente.');
    return this.repositories.orders.getById(orderId);
  }
}
