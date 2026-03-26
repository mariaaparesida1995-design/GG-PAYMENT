import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('painel-atualizar').setDescription('Reenvia o painel no último canal configurado').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption((option) => option.setName('painel').setDescription('Painel').setRequired(true).setAutocomplete(true)),
  async autocomplete(interaction, ctx) {
    const panels = await ctx.services.panelService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(panels.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId); const panelId = interaction.options.getString('painel', true); const panel = await ctx.services.panelService.get(panelId);
    if (!panel?.channelId) return interaction.reply({ content: 'Painel não tem canal salvo. Use /painel-enviar.', ephemeral: true });
    const message = await ctx.services.panelService.sendToChannel(interaction.guild, panelId, panel.channelId, config.visuals);
    await interaction.reply({ content: `Painel atualizado. Nova mensagem: \`${message.id}\``, ephemeral: true });
  },
};
