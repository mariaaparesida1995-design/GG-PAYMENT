import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('ticket-reabrir').setDescription('Reabre o ticket atual').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction, ctx) {
    const ticket = (await ctx.repositories.tickets.listByGuild(interaction.guildId)).find((item) => item.channelId === interaction.channelId);
    if (!ticket) return interaction.reply({ content: 'Este canal não está vinculado a ticket.', ephemeral: true });
    await ctx.services.ticketService.reopen(ticket.id);
    await interaction.channel.permissionOverwrites.edit(ticket.userId, { SendMessages: true, ViewChannel: true }).catch(() => null);
    await interaction.reply({ content: 'Ticket reaberto com sucesso.', ephemeral: false });
  },
};
