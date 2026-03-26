import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('painel-editar').setDescription('Edita um painel').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('painel').setDescription('Painel').setRequired(true).setAutocomplete(true))
    .addStringOption((option) => option.setName('titulo').setDescription('Novo título'))
    .addStringOption((option) => option.setName('descricao').setDescription('Nova descrição'))
    .addStringOption((option) => option.setName('placeholder').setDescription('Novo placeholder'))
    .addStringOption((option) => option.setName('produtos').setDescription('IDs de produtos separados por vírgula')),
  async autocomplete(interaction, ctx) {
    const panels = await ctx.services.panelService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(panels.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const panelId = interaction.options.getString('painel', true); const patch = {};
    const title = interaction.options.getString('titulo'); const description = interaction.options.getString('descricao'); const placeholder = interaction.options.getString('placeholder'); const products = interaction.options.getString('produtos');
    if (title !== null) patch.title = title; if (description !== null) patch.description = description; if (placeholder !== null) patch.placeholder = placeholder; if (products !== null) patch.productIds = products.split(',').map((item) => item.trim()).filter(Boolean);
    const panel = await ctx.services.panelService.update(panelId, patch);
    await interaction.reply({ content: `Painel atualizado: **${panel.name}**`, ephemeral: true });
  },
};
