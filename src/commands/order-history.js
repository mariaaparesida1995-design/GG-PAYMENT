import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { money, shortDate } from '../../utils/format.js';

export default {
  data: new SlashCommandBuilder()
    .setName('historico-pedidos')
    .setDescription('Mostra o histórico recente de pedidos')
    .addUserOption((option) => option.setName('usuario').setDescription('Filtrar por usuário')),

  async execute(interaction, ctx) {
    const user = interaction.options.getUser('usuario');
    const orders = user
      ? await ctx.services.orderService.listByUser(interaction.guildId, user.id)
      : await ctx.services.orderService.listByGuild(interaction.guildId);

    const config = await ctx.repositories.config.get(interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor(config.visuals.primaryColor)
      .setTitle('🧾 Histórico de pedidos')
      .setDescription(
        orders.length
          ? orders
              .slice(0, 20)
              .map(
                (order) =>
                  `**${order.id}** • <@${order.userId}> • ${order.productName}\n${money(order.totalAmount)} • ${order.status}/${order.paymentStatus} • ${shortDate(order.createdAt)}`,
              )
              .join('\n\n')
          : 'Nenhum pedido encontrado.',
      )
      .setFooter({ text: config.visuals.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
