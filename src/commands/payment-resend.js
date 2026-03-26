import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('pagamento-reenviar').setDescription('Reenvia QR e dados do pagamento no ticket').addStringOption((option) => option.setName('pedido').setDescription('ID do pedido').setRequired(true).setAutocomplete(true)),
  async autocomplete(interaction, ctx) {
    const focused = interaction.options.getFocused();
    const orders = await ctx.services.orderService.listByGuild(interaction.guildId);
    const filtered = orders.filter((item) => item.id.toLowerCase().includes(focused.toLowerCase())).slice(0, 25);
    await interaction.respond(filtered.map((item) => ({ name: `${item.id} • ${item.productName}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const order = await ctx.services.orderService.get(interaction.options.getString('pedido', true));
    if (!order || order.guildId !== interaction.guildId) return interaction.reply({ content: 'Pedido não encontrado.', ephemeral: true });
    const channel = interaction.guild.channels.cache.get(order.ticketChannelId);
    if (!channel?.isTextBased()) return interaction.reply({ content: 'Canal do ticket não encontrado.', ephemeral: true });
    await channel.send(`Reenvio solicitado para o pedido \`${order.id}\`.
\`\`\`
${order.qrText || 'Sem QR salvo.'}
\`\`\``);
    await interaction.reply({ content: 'Pagamento reenviado no ticket.', ephemeral: true });
  },
};
