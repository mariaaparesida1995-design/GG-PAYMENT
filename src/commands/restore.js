import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { downloadJsonAttachment } from '../../utils/files.js';
import { ensureAdmin } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder().setName('restaurar').setDescription('Restaura um backup JSON enviado como anexo').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addAttachmentOption((option) => option.setName('arquivo').setDescription('Arquivo de backup JSON').setRequired(true)),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    if (!ensureAdmin(interaction, config)) return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
    await interaction.deferReply({ ephemeral: true });
    const attachment = interaction.options.getAttachment('arquivo', true);
    const payload = await downloadJsonAttachment(attachment);
    await ctx.services.backupService.restoreGuild(interaction.guildId, payload.data);
    await interaction.editReply('Backup restaurado com sucesso.');
  },
};
