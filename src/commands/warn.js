import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('warn').setDescription('Aplica aviso em um usuário').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption((option) => option.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption((option) => option.setName('motivo').setDescription('Motivo').setRequired(true)),
  async execute(interaction, ctx) {
    const user = interaction.options.getUser('usuario', true); const reason = interaction.options.getString('motivo', true);
    const warn = await ctx.services.moderationService.warn(interaction.guild, interaction.user, user, reason);
    await interaction.reply({ content: `Warn aplicado em ${user.tag}. ID: ${warn.id}`, ephemeral: true });
  },
};
