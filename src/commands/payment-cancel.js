import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('pagamento-cancelar').setDescription('Cancela um pedido e a cobrança associada').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption((option) => option.setName('pedido').setDescription('ID do pedido').setRequired(true).setAutocomplete(true)),
  async autocomplete(interaction, ctx) {
    const focused = interaction.options.getFocused();
    const orders = await ctx.services.orderService.listByGuild(interaction.guildId);
    const filtered = orders.filter((item) => item.id.toLowerCase().includes(focused.toLowerCase())).slice(0, 25);
    await interaction.respond(filtered.map((item) => ({ name: `${item.id} • ${item.productName}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const orderId = interaction.options.getString('pedido', true); const cancelled = await ctx.services.orderService.cancel(orderId, interaction.guild);
    await interaction.reply({ content: `Pedido cancelado: **${cancelled.id}**`, ephemeral: true });
  },
};
