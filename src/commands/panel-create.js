import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('painel-criar').setDescription('Cria um painel de loja').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('nome').setDescription('Nome interno').setRequired(true))
    .addStringOption((option) => option.setName('titulo').setDescription('Título do embed').setRequired(true))
    .addStringOption((option) => option.setName('descricao').setDescription('Descrição').setRequired(true))
    .addStringOption((option) => option.setName('placeholder').setDescription('Placeholder do select'))
    .addStringOption((option) => option.setName('produtos').setDescription('IDs dos produtos separados por vírgula')),
  async execute(interaction, ctx) {
    const productIds = (interaction.options.getString('produtos') || '').split(',').map((item) => item.trim()).filter(Boolean);
    const panel = await ctx.services.panelService.create(interaction.guildId, { name: interaction.options.getString('nome', true), title: interaction.options.getString('titulo', true), description: interaction.options.getString('descricao', true), placeholder: interaction.options.getString('placeholder') || 'Escolha um produto', productIds });
    await interaction.reply({ content: `Painel criado: **${panel.name}** (\`${panel.id}\`)`, ephemeral: true });
  },
};
