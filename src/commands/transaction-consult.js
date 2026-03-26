import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { money, shortDate } from '../../utils/format.js';

export default {
  data: new SlashCommandBuilder().setName('transacao-consultar').setDescription('Consulta uma transação pelo ID do pedido').addStringOption((option) => option.setName('id').setDescription('ID do pedido').setRequired(true).setAutocomplete(true)),
  async autocomplete(interaction, ctx) {
    const focused = interaction.options.getFocused();
    const orders = await ctx.services.orderService.listByGuild(interaction.guildId);
    const choices = orders.filter((order) => order.id.toLowerCase().includes(focused.toLowerCase())).slice(0, 25).map((order) => ({ name: `${order.id} • ${order.productName}`, value: order.id }));
    await interaction.respond(choices);
  },
  async execute(interaction, ctx) {
    const id = interaction.options.getString('id', true);
    const order = await ctx.repositories.orders.getById(id);
    if (!order || order.guildId !== interaction.guildId) return interaction.reply({ content: 'Transação não encontrada.', ephemeral: true });
    const config = await ctx.repositories.config.get(interaction.guildId);
    const embed = new EmbedBuilder().setColor(config.visuals.primaryColor).setTitle('📄 Consulta de transação').addFields(
      { name: 'Pedido', value: order.id, inline: true },
      { name: 'Usuário', value: `<@${order.userId}>`, inline: true },
      { name: 'Produto', value: order.productName, inline: true },
      { name: 'Valor', value: money(order.totalAmount), inline: true },
      { name: 'Status do pedido', value: order.status, inline: true },
      { name: 'Status do pagamento', value: order.paymentStatus, inline: true },
      { name: 'Método', value: order.paymentProvider || 'não definido', inline: true },
      { name: 'Criado em', value: shortDate(order.createdAt), inline: true },
    ).setFooter({ text: config.visuals.footer }).setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
