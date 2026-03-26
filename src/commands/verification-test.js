import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('verificacao-testar').setDescription('Mostra seu status de verificação atual'),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    const verified = config.verification.roleId ? interaction.member.roles.cache.has(config.verification.roleId) : false;
    await interaction.reply({ content: verified ? 'Você já está verificado.' : 'Você ainda não está verificado.', ephemeral: true });
  },
};
