import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('kick').setDescription('Expulsa um usuário').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption((option) => option.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption((option) => option.setName('motivo').setDescription('Motivo')),
  async execute(interaction, ctx) {
    const user = interaction.options.getUser('usuario', true); const member = await interaction.guild.members.fetch(user.id); const reason = interaction.options.getString('motivo') || 'Não informado';
    await member.kick(reason); await ctx.services.logService.moderation(interaction.guild, 'Kick', user.tag, interaction.user.tag, reason);
    await interaction.reply({ content: `${user.tag} expulso.`, ephemeral: true });
  },
};
