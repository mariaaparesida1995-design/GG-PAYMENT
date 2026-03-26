import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('ticket-config').setDescription('Configura o sistema de tickets').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) => option.setName('categoria').setDescription('Categoria dos tickets').addChannelTypes(ChannelType.GuildCategory).setRequired(false))
    .addRoleOption((option) => option.setName('staff').setDescription('Cargo staff'))
    .addRoleOption((option) => option.setName('cliente').setDescription('Cargo cliente'))
    .addBooleanOption((option) => option.setName('evitar_duplicados').setDescription('Impedir ticket duplicado'))
    .addBooleanOption((option) => option.setName('fechar_apos_entrega').setDescription('Fechar após entrega')),
  async execute(interaction, ctx) {
    const patch = {}; const category = interaction.options.getChannel('categoria'); const staff = interaction.options.getRole('staff'); const customer = interaction.options.getRole('cliente'); const preventDuplicates = interaction.options.getBoolean('evitar_duplicados'); const closeAfterDelivery = interaction.options.getBoolean('fechar_apos_entrega');
    if (category) patch.categoryId = category.id; if (staff) patch.staffRoleId = staff.id; if (customer) patch.customerRoleId = customer.id; if (preventDuplicates !== null) patch.preventDuplicates = preventDuplicates; if (closeAfterDelivery !== null) patch.closeAfterDelivery = closeAfterDelivery;
    await ctx.repositories.config.patch(interaction.guildId, (config) => { config.tickets = { ...config.tickets, ...patch }; return config; });
    await interaction.reply({ content: 'Configuração de tickets atualizada.', ephemeral: true });
  },
};
