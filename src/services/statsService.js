export class StatsService {
  constructor(repositories) { this.repositories = repositories; }
  async getGuildStats(guildId) {
    const [orders, products, tickets] = await Promise.all([this.repositories.orders.listByGuild(guildId), this.repositories.products.listByGuild(guildId), this.repositories.tickets.listByGuild(guildId)]);
    const approved = orders.filter((item) => item.paymentStatus === 'approved' || item.status === 'approved' || item.status === 'delivered');
    const cancelled = orders.filter((item) => item.status === 'cancelled' || item.paymentStatus === 'cancelled');
    const pending = orders.filter((item) => item.status === 'pending');
    const grossRevenue = approved.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const productCounts = new Map();
    for (const order of approved) productCounts.set(order.productName, (productCounts.get(order.productName) ?? 0) + 1);
    const topProducts = [...productCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    return { totalSales: orders.length, approvedPayments: approved.length, totalTickets: tickets.length, totalProducts: products.length, totalStock: products.reduce((sum, item) => sum + Number(item.stock || 0), 0), grossRevenue, pendingOrders: pending.length, approvedOrders: approved.length, cancelledOrders: cancelled.length, topProducts };
  }
}
