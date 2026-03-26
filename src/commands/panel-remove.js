import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('painel-remover').setDescription('Remove um painel').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption((option) => option.setName('painel').setDescription('Painel').setRequired(true).setAutocomplete(true)),
  async autocomplete(interaction, ctx) {
    const panels = await ctx.services.panelService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(panels.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const panelId = interaction.options.getString('painel', true); const panel = await ctx.services.panelService.get(panelId);
    if (!panel || panel.guildId !== interaction.guildId) return interaction.reply({ content: 'Painel não encontrado.', ephemeral: true });
    await ctx.services.panelService.remove(panelId); await interaction.reply({ content: `Painel removido: **${panel.name}**`, ephemeral: true });
  },
};
