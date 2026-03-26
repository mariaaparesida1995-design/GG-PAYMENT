import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('pagamento-config').setDescription('Configura o modo de pagamento da loja').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) => option.setName('modo').setDescription('Modo padrão').setRequired(false).addChoices({ name: 'Híbrido', value: 'hybrid' }, { name: 'Mercado Pago', value: 'mercadopago' }, { name: 'PIX manual', value: 'pix_manual' }))
    .addBooleanOption((option) => option.setName('aprovar_auto').setDescription('Aprovar automaticamente'))
    .addBooleanOption((option) => option.setName('aprovar_staff').setDescription('Exigir botão da staff'))
    .addStringOption((option) => option.setName('pix_key').setDescription('Chave PIX manual'))
    .addStringOption((option) => option.setName('pix_receiver').setDescription('Nome do recebedor'))
    .addStringOption((option) => option.setName('pix_copia_cola').setDescription('Texto copia e cola')),
  async execute(interaction, ctx) {
    const mode = interaction.options.getString('modo'); const autoApprove = interaction.options.getBoolean('aprovar_auto'); const staffManualApproval = interaction.options.getBoolean('aprovar_staff'); const pixKey = interaction.options.getString('pix_key'); const pixReceiver = interaction.options.getString('pix_receiver'); const pixCopyPaste = interaction.options.getString('pix_copia_cola');
    await ctx.repositories.config.patch(interaction.guildId, (config) => { if (mode !== null) config.payments.mode = mode; if (autoApprove !== null) config.payments.autoApprove = autoApprove; if (staffManualApproval !== null) config.payments.staffManualApproval = staffManualApproval; if (pixKey !== null) config.payments.pixManual.key = pixKey; if (pixReceiver !== null) config.payments.pixManual.receiverName = pixReceiver; if (pixCopyPaste !== null) config.payments.pixManual.copyPaste = pixCopyPaste; return config; });
    await interaction.reply({ content: 'Configuração de pagamentos atualizada.', ephemeral: true });
  },
};
