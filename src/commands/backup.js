import { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ensureAdmin } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder().setName('backup').setDescription('Exporta um backup JSON do servidor').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    if (!ensureAdmin(interaction, config)) return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
    const backup = await ctx.services.backupService.exportGuild(interaction.guildId);
    const built = ctx.services.backupService.buildAttachment(backup);
    const attachment = new AttachmentBuilder(built.data, { name: built.name });
    await interaction.reply({ content: 'Backup gerado com sucesso.', files: [attachment], ephemeral: true });
  },
};
