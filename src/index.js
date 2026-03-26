import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import { createAppContext } from './lib/context.js';
import { loadCommandModules, loadEventModules } from './lib/loaders.js';
import { env } from './utils/env.js';
import { logger } from './utils/logger.js';

const ctx = createAppContext();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.ctx = ctx;
client.logger = logger;
client.publicBaseUrl = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'ggbux-premium-sales-bot', botReady: client.isReady(), timestamp: new Date().toISOString() });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/webhooks/mercadopago', async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query?.id;
    if (!paymentId) return res.status(200).json({ ok: true, ignored: true });
    const orders = await ctx.repositories.orders.all();
    const order = orders.find((item) => item.paymentProviderId === String(paymentId));
    if (!order) return res.status(200).json({ ok: true, ignored: true });
    const guild = client.guilds.cache.get(order.guildId);
    if (!guild) return res.status(200).json({ ok: true, ignored: true });
    const fresh = await ctx.services.orderService.refreshPayment(order.id, guild);
    const config = await ctx.repositories.config.get(guild.id);
    if (fresh.paymentStatus === 'approved' && config.payments.autoApprove) {
      await ctx.services.orderService.deliver(order.id, guild, config).catch(() => null);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error('Erro no webhook do Mercado Pago', error);
    return res.status(500).json({ ok: false });
  }
});

const commandModules = await loadCommandModules();
for (const command of commandModules) client.commands.set(command.data.name, command);

const eventModules = await loadEventModules();
for (const event of eventModules) {
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

app.listen(env.PORT, () => logger.info(`HTTP online na porta ${env.PORT}`));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error));
process.on('uncaughtException', (error) => logger.error('Uncaught exception', error));
await client.login(env.DISCORD_TOKEN);

