import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('produto-criar').setDescription('Cria um novo produto').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('nome').setDescription('Nome do produto').setRequired(true))
    .addNumberOption((option) => option.setName('preco').setDescription('Preço atual').setRequired(true))
    .addStringOption((option) => option.setName('descricao').setDescription('Descrição').setRequired(true))
    .addStringOption((option) => option.setName('tipo_entrega').setDescription('Tipo de entrega').setRequired(true).addChoices({ name: 'Estoque', value: 'stock' }, { name: 'Texto', value: 'text' }, { name: 'Manual', value: 'manual' }))
    .addStringOption((option) => option.setName('categoria').setDescription('Categoria'))
    .addStringOption((option) => option.setName('emoji').setDescription('Emoji'))
    .addStringOption((option) => option.setName('delivery_text').setDescription('Texto de entrega, quando aplicável'))
    .addIntegerOption((option) => option.setName('estoque').setDescription('Estoque inicial'))
    .addBooleanOption((option) => option.setName('ilimitado').setDescription('Estoque ilimitado'))
    .addBooleanOption((option) => option.setName('destaque').setDescription('Produto em destaque'))
    .addBooleanOption((option) => option.setName('promocao').setDescription('Produto em promoção')),
  async execute(interaction, ctx) {
    const product = await ctx.services.productService.create(interaction.guildId, {
      name: interaction.options.getString('nome', true), price: interaction.options.getNumber('preco', true), description: interaction.options.getString('descricao', true),
      deliveryType: interaction.options.getString('tipo_entrega', true), category: interaction.options.getString('categoria') || 'geral', emoji: interaction.options.getString('emoji') || '🛒',
      deliveryText: interaction.options.getString('delivery_text') || '', stock: interaction.options.getInteger('estoque') || 0, unlimitedStock: interaction.options.getBoolean('ilimitado') || false,
      featured: interaction.options.getBoolean('destaque') || false, promotional: interaction.options.getBoolean('promocao') || false,
    });
    await interaction.reply({ content: `Produto criado: **${product.name}** (\`${product.id}\`)`, ephemeral: true });
  },
};
