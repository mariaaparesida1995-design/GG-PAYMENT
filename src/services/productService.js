import { createId } from '../utils/ids.js';

export class ProductService {
  constructor(repositories, logService) { this.repositories = repositories; this.logService = logService; }
  async create(guildId, payload) {
    const product = {
      id: createId('PROD'), guildId, name: payload.name, price: Number(payload.price), oldPrice: Number(payload.oldPrice || 0), promotionalPrice: Number(payload.promotionalPrice || 0),
      description: payload.description || 'Sem descrição.', internalNote: payload.internalNote || '', category: payload.category || 'geral', subcategory: payload.subcategory || '', emoji: payload.emoji || '🛒',
      imageUrl: payload.imageUrl || '', gifUrl: payload.gifUrl || '', bannerUrl: payload.bannerUrl || '', thumbnailUrl: payload.thumbnailUrl || '', deliveryType: payload.deliveryType || 'manual',
      acceptedPaymentMode: payload.acceptedPaymentMode || 'hybrid', stock: Number(payload.stock || 0), unlimitedStock: Boolean(payload.unlimitedStock), lowStockAlert: Boolean(payload.lowStockAlert ?? true),
      previewStyle: payload.previewStyle || 'premium', order: Number(payload.order || 0), premium: Boolean(payload.premium), isNew: Boolean(payload.isNew), promotional: Boolean(payload.promotional),
      featured: Boolean(payload.featured), active: payload.active ?? true, hidden: payload.hidden ?? false, archived: false, deliveryText: payload.deliveryText || '', stockItems: payload.stockItems || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await this.repositories.products.create(product);
    return product;
  }
  async list(guildId, { activeOnly = false, includeArchived = false } = {}) {
    let items = await this.repositories.products.listByGuild(guildId);
    if (activeOnly) items = items.filter((item) => item.active && !item.hidden);
    if (!includeArchived) items = items.filter((item) => !item.archived);
    return items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }
  async get(productId) { return this.repositories.products.getById(productId); }
  async update(productId, patch) {
    await this.repositories.products.update(productId, (current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
    return this.repositories.products.getById(productId);
  }
  async remove(productId) { return this.repositories.products.delete(productId); }
  async adjustStock(productId, quantityDelta) {
    await this.repositories.products.update(productId, (product) => {
      const next = { ...product };
      if (!next.unlimitedStock) next.stock = Math.max(0, Number(next.stock) + Number(quantityDelta));
      next.updatedAt = new Date().toISOString();
      return next;
    });
    return this.get(productId);
  }
  async autocomplete(guildId, query) {
    const items = await this.list(guildId, { includeArchived: true });
    const lowered = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lowered) || item.id.toLowerCase().includes(lowered)).slice(0, 25);
  }
}
