import 'dotenv/config';

const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Variável obrigatória ausente: ${key}`);
}

export const env = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID ?? '',
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ?? '',
  PORT: Number(process.env.PORT ?? 3000),
};

