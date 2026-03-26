export class RuntimeStore {
  constructor() { this.paymentRefreshLocks = new Set(); }
  lockRefresh(orderId) { if (this.paymentRefreshLocks.has(orderId)) return false; this.paymentRefreshLocks.add(orderId); return true; }
  unlockRefresh(orderId) { this.paymentRefreshLocks.delete(orderId); }
}
