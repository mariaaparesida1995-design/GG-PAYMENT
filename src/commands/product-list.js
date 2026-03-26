import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { money } from '../../utils/format.js';

export default {
  data: new SlashCommandBuilder()
    .setName('produto-listar')
    .setDescription('Lista os produtos cadastrados')
    .addBooleanOption((option) => option.setName('mostrar_arquivados').setDescription('Mostrar arquivados')),

  async execute(interaction, ctx) {
    const showArchived = interaction.options.getBoolean('mostrar_arquivados') || false;
    const config = await ctx.repositories.config.get(interaction.guildId);
    const products = await ctx.services.productService.list(interaction.guildId, { includeArchived: showArchived });

    const embed = new EmbedBuilder()
      .setColor(config.visuals.primaryColor)
      .setTitle('📦 Produtos cadastrados')
      .setDescription(
        products.length
          ? products
              .slice(0, 25)
              .map(
                (product) =>
                  `**${product.name}** • \`${product.id}\`\n${money(product.promotionalPrice || product.price)} • estoque ${product.unlimitedStock ? '∞' : product.stock}`,
              )
              .join('\n\n')
          : 'Nenhum produto cadastrado.',
      )
      .setFooter({ text: config.visuals.footer })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
