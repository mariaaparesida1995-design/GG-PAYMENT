import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('verificacao-painel').setDescription('Envia o painel de verificação').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption((option) => option.setName('canal').setDescription('Canal de destino').addChannelTypes(ChannelType.GuildText).setRequired(true)),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId); const channel = interaction.options.getChannel('canal', true);
    await ctx.services.verificationService.sendPanel(channel, config);
    await interaction.reply({ content: `Painel enviado em ${channel}.`, ephemeral: true });
  },
};
