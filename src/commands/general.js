import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { buildDashboardComponents } from '../../ui/dashboard.js';
import { buildDashboardEmbed } from '../../ui/embeds.js';
import { ensureAdmin } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder().setName('geral').setDescription('Central administrativa principal da loja').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, ctx) {
    const guildConfig = await ctx.repositories.config.get(interaction.guildId);
    if (!ensureAdmin(interaction, guildConfig)) return interaction.reply({ content: 'Você não pode usar este painel.', ephemeral: true });
    const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);
    return interaction.reply({ embeds: [buildDashboardEmbed(interaction.guild, guildConfig, stats)], components: buildDashboardComponents(guildConfig), ephemeral: true });
  },
};
