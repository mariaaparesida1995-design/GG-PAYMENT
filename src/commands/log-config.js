import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('log-config').setDescription('Configura o canal principal de logs').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption((option) => option.setName('canal').setDescription('Canal de logs').setRequired(true).addChannelTypes(ChannelType.GuildText)),
  async execute(interaction, ctx) {
    const channel = interaction.options.getChannel('canal', true);
    await ctx.repositories.config.patch(interaction.guildId, (config) => { config.logs.channelId = channel.id; return config; });
    await interaction.reply({ content: `Canal de logs definido para ${channel}.`, ephemeral: true });
  },
};
