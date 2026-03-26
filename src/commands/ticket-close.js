import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('ticket-fechar').setDescription('Fecha o ticket atual').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).addStringOption((option) => option.setName('motivo').setDescription('Motivo')),
  async execute(interaction, ctx) {
    const ticket = (await ctx.repositories.tickets.listByGuild(interaction.guildId)).find((item) => item.channelId === interaction.channelId && item.status === 'open');
    if (!ticket) return interaction.reply({ content: 'Este canal não é um ticket aberto.', ephemeral: true });
    const reason = interaction.options.getString('motivo') || 'Fechado via comando';
    await ctx.services.ticketService.close(ticket.id, reason);
    await interaction.channel.permissionOverwrites.edit(ticket.userId, { SendMessages: false }).catch(() => null);
    await interaction.reply({ content: `Ticket fechado. Motivo: ${reason}`, ephemeral: false });
  },
};
