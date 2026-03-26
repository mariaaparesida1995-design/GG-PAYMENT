function write(level, message, extra) {
  const stamp = new Date().toISOString();
  if (extra) return console[level](`[${stamp}] ${message}`, extra);
  return console[level](`[${stamp}] ${message}`);
}
export const logger = {
  info: (message, extra) => write('log', message, extra),
  warn: (message, extra) => write('warn', message, extra),
  error: (message, extra) => write('error', message, extra),
};
