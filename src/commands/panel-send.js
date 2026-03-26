import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('painel-enviar').setDescription('Envia um painel de compras para um canal').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('painel').setDescription('Painel').setRequired(true).setAutocomplete(true))
    .addChannelOption((option) => option.setName('canal').setDescription('Canal de destino').addChannelTypes(ChannelType.GuildText).setRequired(true)),
  async autocomplete(interaction, ctx) {
    const panels = await ctx.services.panelService.autocomplete(interaction.guildId, interaction.options.getFocused());
    await interaction.respond(panels.map((item) => ({ name: `${item.name} • ${item.id}`, value: item.id })));
  },
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId); const panelId = interaction.options.getString('painel', true); const channel = interaction.options.getChannel('canal', true);
    const message = await ctx.services.panelService.sendToChannel(interaction.guild, panelId, channel.id, config.visuals);
    await interaction.reply({ content: `Painel enviado em ${channel}. Mensagem: \`${message.id}\``, ephemeral: true });
  },
};
