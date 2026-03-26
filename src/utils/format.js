export function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}
export function shortDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
export function boolIcon(value) { return value ? '🟢' : '🔴'; }
export function truncate(text, max = 100) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
export function channelMention(id) { return id ? `<#${id}>` : '`não definido`'; }
export function roleMention(id) { return id ? `<@&${id}>` : '`não definido`'; }
export function userMention(id) { return id ? `<@${id}>` : '`não definido`'; }
