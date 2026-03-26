import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { money } from '../../utils/format.js';

export default {
  data: new SlashCommandBuilder().setName('stats').setDescription('Mostra estatísticas da loja'),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor(config.visuals.primaryColor)
      .setTitle('📈 Estatísticas da loja')
      .addFields(
        { name: 'Total de vendas', value: String(stats.totalSales), inline: true },
        { name: 'Pagamentos aprovados', value: String(stats.approvedPayments), inline: true },
        { name: 'Tickets', value: String(stats.totalTickets), inline: true },
        { name: 'Produtos', value: String(stats.totalProducts), inline: true },
        { name: 'Estoque total', value: String(stats.totalStock), inline: true },
        { name: 'Faturamento bruto', value: money(stats.grossRevenue), inline: true },
        {
          name: 'Produtos mais vendidos',
          value: stats.topProducts.length
            ? stats.topProducts.map((item) => `${item.name} • ${item.count}`).join('\n')
            : 'Sem dados',
          inline: false,
        },
      )
      .setFooter({ text: config.visuals.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
