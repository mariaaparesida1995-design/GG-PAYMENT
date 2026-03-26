import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('ban').setDescription('Bane um usuário').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption((option) => option.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption((option) => option.setName('motivo').setDescription('Motivo')),
  async execute(interaction, ctx) {
    const user = interaction.options.getUser('usuario', true); const reason = interaction.options.getString('motivo') || 'Não informado';
    await interaction.guild.members.ban(user.id, { reason }); await ctx.services.logService.moderation(interaction.guild, 'Ban', user.tag, interaction.user.tag, reason);
    await interaction.reply({ content: `${user.tag} banido.`, ephemeral: true });
  },
};
