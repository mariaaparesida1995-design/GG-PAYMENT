import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { buildConfigEmbed } from '../../ui/embeds.js';
import { buildDashboardComponents } from '../../ui/dashboard.js';
import { ensureAdmin } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder().setName('configurar').setDescription('Abre o assistente rápido de configuração').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    if (!ensureAdmin(interaction, config)) return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
    const embed = buildConfigEmbed('🔧 Assistente de configuração', 'Use os seletores abaixo para ajustar staff, verificação, logs, categoria de ticket e alerta de estoque.', config);
    const components = buildDashboardComponents(config).slice(2);
    await interaction.reply({ embeds: [embed], components, ephemeral: true });
  },
};
