import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('estoque-remover').setDescription('Remove estoque de um produto').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('produto').setDescription('Produto').setRequired(true).setAutocomplete(true))
    .addIntegerOption((option) => option.setName('quantidade').setDescription('Quantidade').setRequired(true)),
  async autocomplete(interaction, ctx) {
    const products = await ctx.services.productService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(products.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const productId = interaction.options.getString('produto', true); const quantity = interaction.options.getInteger('quantidade', true);
    const product = await ctx.services.productService.adjustStock(productId, -Math.abs(quantity));
    await ctx.services.logService.stock(interaction.guild, product.name, quantity, 'remover');
    await interaction.reply({ content: `Estoque atualizado: **${product.name}** agora tem ${product.unlimitedStock ? '∞' : product.stock}.`, ephemeral: true });
  },
};
