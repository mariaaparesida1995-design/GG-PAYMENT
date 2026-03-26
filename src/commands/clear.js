import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('clear').setDescription('Limpa mensagens do canal atual').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption((option) => option.setName('quantidade').setDescription('Quantidade de mensagens').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('quantidade', true); const messages = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `${messages.size} mensagens removidas.`, ephemeral: true });
  },
};
