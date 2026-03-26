import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { loadCommandModules } from '../src/lib/loaders.js';
import { logger } from '../src/utils/logger.js';
import { env } from '../src/utils/env.js';

const commands = await loadCommandModules();
const body = commands.map((command) => command.data.toJSON());
const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
const route = env.GUILD_ID
  ? Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID)
  : Routes.applicationCommands(env.CLIENT_ID);

try {
  logger.info(`Registrando ${body.length} comandos...`);
  await rest.put(route, { body });
  logger.info('Comandos registrados com sucesso.');
} catch (error) {
  logger.error('Falha ao registrar comandos', error);
  process.exitCode = 1;
}

