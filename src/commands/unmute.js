import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('unmute').setDescription('Remove timeout de um usuário').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption((option) => option.setName('usuario').setDescription('Usuário').setRequired(true)),
  async execute(interaction, ctx) {
    const user = interaction.options.getUser('usuario', true); const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(null); await ctx.services.logService.moderation(interaction.guild, 'Unmute', user.tag, interaction.user.tag, 'Timeout removido');
    await interaction.reply({ content: `${user.tag} desmutado.`, ephemeral: true });
  },
};
