import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('produto-remover').setDescription('Remove um produto').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption((option) => option.setName('produto').setDescription('Produto').setRequired(true).setAutocomplete(true)),
  async autocomplete(interaction, ctx) {
    const products = await ctx.services.productService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(products.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const productId = interaction.options.getString('produto', true); const product = await ctx.services.productService.get(productId);
    if (!product || product.guildId !== interaction.guildId) return interaction.reply({ content: 'Produto não encontrado.', ephemeral: true });
    await ctx.services.productService.remove(productId); await interaction.reply({ content: `Produto removido: **${product.name}**`, ephemeral: true });
  },
};
