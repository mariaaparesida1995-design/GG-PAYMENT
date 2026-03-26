export function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}_${Date.now().toString(36).toUpperCase()}_${random}`;
}
