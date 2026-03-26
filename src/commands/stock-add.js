import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('estoque-adicionar')
    .setDescription('Adiciona estoque e itens de entrega')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('produto').setDescription('Produto').setRequired(true).setAutocomplete(true))
    .addIntegerOption((option) => option.setName('quantidade').setDescription('Quantidade numérica').setRequired(true))
    .addStringOption((option) => option.setName('itens').setDescription('Itens separados por quebra de linha para entrega automática')),

  async autocomplete(interaction, ctx) {
    const products = await ctx.services.productService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(products.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },

  async execute(interaction, ctx) {
    const productId = interaction.options.getString('produto', true);
    const quantity = interaction.options.getInteger('quantidade', true);
    const itemsInput = interaction.options.getString('itens') || '';
    const items = itemsInput ? itemsInput.split('\n').map((line) => line.trim()).filter(Boolean) : [];

    const product = await ctx.services.productService.adjustStock(productId, quantity);
    const current = await ctx.repositories.products.getById(productId);
    await ctx.repositories.products.update(productId, {
      stockItems: [...(current.stockItems || []), ...items],
      updatedAt: new Date().toISOString(),
    });

    await ctx.services.logService.stock(interaction.guild, product.name, quantity, 'adicionar');
    await interaction.reply({ content: `Estoque atualizado: **${product.name}** agora tem ${product.unlimitedStock ? '∞' : product.stock}.`, ephemeral: true });
  },
};
