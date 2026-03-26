import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('estoque-ver')
    .setDescription('Mostra o estoque detalhado de um produto')
    .addStringOption((option) => option.setName('produto').setDescription('Produto').setRequired(true).setAutocomplete(true)),

  async autocomplete(interaction, ctx) {
    const products = await ctx.services.productService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(products.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },

  async execute(interaction, ctx) {
    const product = await ctx.services.productService.get(interaction.options.getString('produto', true));
    if (!product || product.guildId !== interaction.guildId) {
      return interaction.reply({ content: 'Produto não encontrado.', ephemeral: true });
    }

    const config = await ctx.repositories.config.get(interaction.guildId);
    const items = product.stockItems || [];
    const embed = new EmbedBuilder()
      .setColor(config.visuals.primaryColor)
      .setTitle(`📦 Estoque • ${product.name}`)
      .setDescription(
        `Quantidade: **${product.unlimitedStock ? '∞' : product.stock}**\nItens automáticos: **${items.length}**\n\n${items
          .slice(0, 15)
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n') || 'Sem itens cadastrados.'}`,
      )
      .setFooter({ text: config.visuals.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
