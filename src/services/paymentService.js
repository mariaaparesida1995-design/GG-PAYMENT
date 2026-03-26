import QRCode from 'qrcode';
import { AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { money, shortDate } from '../utils/format.js';

export class PaymentService {
  constructor(repositories, mercadoPagoService, logService) { this.repositories = repositories; this.mercadoPagoService = mercadoPagoService; this.logService = logService; }
  async createForOrder(guild, order, user, product, guildConfig, publicBaseUrl) {
    const mode = this.resolveMode(product.acceptedPaymentMode, guildConfig.payments.mode);
    if (mode === 'mercadopago') {
      const payment = await this.mercadoPagoService.createPixPayment({ amount: order.totalAmount, description: product.name, payerEmail: `${user.id}@discord.local`, externalReference: order.id, notificationUrl: publicBaseUrl ? `${publicBaseUrl}/webhooks/mercadopago` : undefined });
      await this.repositories.orders.update(order.id, { paymentProvider: 'mercadopago', paymentProviderId: payment.providerPaymentId, paymentStatus: payment.status, qrText: payment.qrText, updatedAt: new Date().toISOString() });
      return { mode: 'mercadopago', payment };
    }
    const manual = guildConfig.payments.pixManual;
    const qrText = manual.qrText || manual.copyPaste || manual.key || '';
    const qrPngBuffer = qrText ? await QRCode.toBuffer(qrText, { type: 'png', margin: 1, scale: 8 }) : null;
    await this.repositories.orders.update(order.id, { paymentProvider: 'pix_manual', paymentProviderId: '', paymentStatus: 'pending_manual', qrText, updatedAt: new Date().toISOString() });
    return { mode: 'pix_manual', payment: { provider: 'pix_manual', providerPaymentId: '', status: 'pending_manual', qrText, qrPngBuffer } };
  }
  resolveMode(productMode, configMode) { if (productMode && productMode !== 'hybrid') return productMode; return configMode === 'hybrid' ? (this.mercadoPagoService.enabled ? 'mercadopago' : 'pix_manual') : configMode; }
  async syncStatus(order) {
    if (order.paymentProvider !== 'mercadopago' || !order.paymentProviderId) return order;
    const fresh = await this.mercadoPagoService.getPayment(order.paymentProviderId);
    const mapped = this.mapProviderStatus(fresh.status, order.expiresAt);
    await this.repositories.orders.update(order.id, { paymentStatus: mapped, updatedAt: new Date().toISOString(), paymentSnapshot: fresh });
    return this.repositories.orders.getById(order.id);
  }
  async cancel(order) {
    if (order.paymentProvider === 'mercadopago' && order.paymentProviderId) await this.mercadoPagoService.cancelPayment(order.paymentProviderId).catch(() => null);
    await this.repositories.orders.update(order.id, { status: 'cancelled', paymentStatus: 'cancelled', updatedAt: new Date().toISOString() });
    return this.repositories.orders.getById(order.id);
  }
  mapProviderStatus(providerStatus, expiresAt) {
    if (providerStatus === 'approved') return 'approved';
    if (providerStatus === 'cancelled') return 'cancelled';
    if (providerStatus === 'rejected') return 'rejected';
    if (expiresAt && new Date(expiresAt).getTime() < Date.now() && providerStatus === 'pending') return 'expired';
    return providerStatus || 'pending';
  }
  buildOrderPaymentMessage(order, guildConfig) {
    const embed = new EmbedBuilder().setColor(guildConfig.visuals.primaryColor).setTitle('💳 Pagamento do pedido').setDescription(guildConfig.tickets.paymentMessage).addFields(
      { name: 'Pedido', value: order.id, inline: true },
      { name: 'Valor', value: money(order.totalAmount), inline: true },
      { name: 'Status', value: order.paymentStatus || 'pending', inline: true },
      { name: 'Método', value: order.paymentProvider || 'aguardando', inline: true },
      { name: 'Criado em', value: shortDate(order.createdAt), inline: true },
    ).setFooter({ text: guildConfig.visuals.footer }).setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`payment:refresh:${order.id}`).setLabel('Atualizar').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`payment:resend:${order.id}`).setLabel('Reenviar QR').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`payment:cancel:${order.id}`).setLabel('Cancelar').setStyle(ButtonStyle.Danger),
    );
    const manualRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`payment:approve:${order.id}`).setLabel('Aprovar manualmente').setStyle(ButtonStyle.Success));
    return { embed, rows: guildConfig.payments.staffManualApproval ? [row, manualRow] : [row] };
  }
  buildQrAttachment(order, payment) { return payment?.qrPngBuffer ? new AttachmentBuilder(payment.qrPngBuffer, { name: `qr-${order.id}.png` }) : null; }
}
