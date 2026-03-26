import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder } from 'discord.js';
import { money, shortDate } from '../../utils/format.js';

export default {
  data: new ContextMenuCommandBuilder().setName('Histórico do Cliente').setType(ApplicationCommandType.User),
  async execute(interaction, ctx) {
    const target = interaction.targetUser;
    const orders = await ctx.services.orderService.listByUser(interaction.guildId, target.id);
    const config = await ctx.repositories.config.get(interaction.guildId);

    const embed = new EmbedBuilder()
      .setColor(config.visuals.primaryColor)
      .setTitle(`🧾 Histórico • ${target.tag}`)
      .setDescription(
        orders.length
          ? orders
              .slice(0, 15)
              .map(
                (order) =>
                  `**${order.id}** • ${order.productName}\n${money(order.totalAmount)} • ${order.status}/${order.paymentStatus} • ${shortDate(order.createdAt)}`,
              )
              .join('\n\n')
          : 'Nenhum pedido encontrado para este usuário.',
      )
      .setFooter({ text: config.visuals.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
