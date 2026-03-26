import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { money } from '../../utils/format.js';

export default {
  data: new SlashCommandBuilder().setName('status-sistema').setDescription('Mostra a saúde e o resumo do sistema').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);
    const embed = new EmbedBuilder().setColor(config.visuals.primaryColor).setTitle('🧠 Status do sistema').addFields(
      { name: 'Loja aberta', value: String(config.store.open), inline: true },
      { name: 'Manutenção', value: String(config.store.maintenance), inline: true },
      { name: 'Modo de pagamento', value: config.payments.mode, inline: true },
      { name: 'Total de vendas', value: String(stats.totalSales), inline: true },
      { name: 'Pendentes', value: String(stats.pendingOrders), inline: true },
      { name: 'Faturamento', value: money(stats.grossRevenue), inline: true },
    ).setFooter({ text: config.visuals.footer }).setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
