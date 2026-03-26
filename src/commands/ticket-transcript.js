import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { createTranscriptAttachment } from '../../utils/transcript.js';
export default {
  data: new SlashCommandBuilder().setName('ticket-transcript').setDescription('Gera transcript do ticket atual').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const attachment = await createTranscriptAttachment(interaction.channel);
    await interaction.reply({ content: 'Transcript gerado.', files: [attachment], ephemeral: true });
  },
};
