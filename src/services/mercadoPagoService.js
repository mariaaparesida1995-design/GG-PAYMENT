import QRCode from 'qrcode';
import { env } from '../utils/env.js';

export class MercadoPagoService {
  constructor() { this.accessToken = env.MP_ACCESS_TOKEN; this.baseUrl = 'https://api.mercadopago.com'; }
  get enabled() { return Boolean(this.accessToken); }
  headers(extra = {}) { return { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json', ...extra }; }
  async createPixPayment({ amount, description, payerEmail, externalReference, notificationUrl }) {
    if (!this.enabled) throw new Error('Mercado Pago não configurado.');
    const idempotencyKey = crypto.randomUUID();
    const body = { transaction_amount: Number(amount), description, payment_method_id: 'pix', external_reference: externalReference, notification_url: notificationUrl || undefined, payer: { email: payerEmail || 'cliente@example.com' } };
    const response = await fetch(`${this.baseUrl}/v1/payments`, { method: 'POST', headers: this.headers({ 'X-Idempotency-Key': idempotencyKey }), body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Falha ao criar pagamento no Mercado Pago.');
    const qrText = data.point_of_interaction?.transaction_data?.qr_code || data.point_of_interaction?.transaction_data?.qr_data || '';
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64 || '';
    const qrPngBuffer = qrCodeBase64 ? Buffer.from(qrCodeBase64, 'base64') : qrText ? await QRCode.toBuffer(qrText, { type: 'png', margin: 1, scale: 8 }) : null;
    return { provider: 'mercadopago', providerPaymentId: String(data.id), status: data.status || 'pending', qrText, qrPngBuffer, raw: data };
  }
  async getPayment(paymentId) {
    if (!this.enabled) throw new Error('Mercado Pago não configurado.');
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, { headers: this.headers() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Falha ao consultar pagamento.');
    return data;
  }
  async cancelPayment(paymentId) {
    if (!this.enabled) throw new Error('Mercado Pago não configurado.');
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, { method: 'PUT', headers: this.headers({ 'X-Idempotency-Key': crypto.randomUUID() }), body: JSON.stringify({ status: 'cancelled' }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Falha ao cancelar pagamento.');
    return data;
  }
}
