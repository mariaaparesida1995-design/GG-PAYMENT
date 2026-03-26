import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('produto-editar').setDescription('Edita campos principais de um produto').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('produto').setDescription('Produto').setRequired(true).setAutocomplete(true))
    .addStringOption((option) => option.setName('nome').setDescription('Novo nome'))
    .addNumberOption((option) => option.setName('preco').setDescription('Novo preço'))
    .addStringOption((option) => option.setName('descricao').setDescription('Nova descrição'))
    .addBooleanOption((option) => option.setName('ativo').setDescription('Ativar/desativar'))
    .addBooleanOption((option) => option.setName('oculto').setDescription('Ocultar/exibir'))
    .addBooleanOption((option) => option.setName('arquivado').setDescription('Arquivar/restaurar'))
    .addStringOption((option) => option.setName('tipo_pagamento').setDescription('Pagamento aceito').addChoices({ name: 'Híbrido', value: 'hybrid' }, { name: 'Mercado Pago', value: 'mercadopago' }, { name: 'PIX manual', value: 'pix_manual' })),
  async autocomplete(interaction, ctx) {
    const focused = interaction.options.getFocused();
    const products = await ctx.services.productService.autocomplete(interaction.guildId, focused);
    await interaction.respond(products.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const productId = interaction.options.getString('produto', true); const patch = {};
    const name = interaction.options.getString('nome'); const price = interaction.options.getNumber('preco'); const description = interaction.options.getString('descricao');
    const active = interaction.options.getBoolean('ativo'); const hidden = interaction.options.getBoolean('oculto'); const archived = interaction.options.getBoolean('arquivado'); const acceptedPaymentMode = interaction.options.getString('tipo_pagamento');
    if (name !== null) patch.name = name; if (price !== null) patch.price = price; if (description !== null) patch.description = description; if (active !== null) patch.active = active; if (hidden !== null) patch.hidden = hidden; if (archived !== null) patch.archived = archived; if (acceptedPaymentMode !== null) patch.acceptedPaymentMode = acceptedPaymentMode;
    const updated = await ctx.services.productService.update(productId, patch);
    await interaction.reply({ content: `Produto atualizado: **${updated.name}**`, ephemeral: true });
  },
};
