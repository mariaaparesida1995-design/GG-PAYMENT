import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('mute').setDescription('Silencia um usuário por minutos').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption((option) => option.setName('usuario').setDescription('Usuário').setRequired(true)).addIntegerOption((option) => option.setName('minutos').setDescription('Minutos').setRequired(true).setMinValue(1).setMaxValue(10080)).addStringOption((option) => option.setName('motivo').setDescription('Motivo')),
  async execute(interaction, ctx) {
    const user = interaction.options.getUser('usuario', true); const member = await interaction.guild.members.fetch(user.id); const minutes = interaction.options.getInteger('minutos', true); const reason = interaction.options.getString('motivo') || 'Não informado';
    await member.timeout(minutes * 60 * 1000, reason); await ctx.services.logService.moderation(interaction.guild, 'Mute', user.tag, interaction.user.tag, reason);
    await interaction.reply({ content: `${user.tag} mutado por ${minutes} minuto(s).`, ephemeral: true });
  },
};
