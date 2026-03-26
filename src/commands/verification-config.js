import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('verificacao-config').setDescription('Configura o sistema de verificação').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption((option) => option.setName('ativo').setDescription('Ativar'))
    .addRoleOption((option) => option.setName('cargo').setDescription('Cargo de verificação'))
    .addBooleanOption((option) => option.setName('bloquear_loja').setDescription('Bloquear compra até verificar'))
    .addStringOption((option) => option.setName('mensagem').setDescription('Mensagem do painel')),
  async execute(interaction, ctx) {
    const active = interaction.options.getBoolean('ativo'); const role = interaction.options.getRole('cargo'); const blockStore = interaction.options.getBoolean('bloquear_loja'); const message = interaction.options.getString('mensagem');
    await ctx.repositories.config.patch(interaction.guildId, (config) => { if (active !== null) config.verification.enabled = active; if (role) config.verification.roleId = role.id; if (blockStore !== null) { config.verification.blockStoreUntilVerified = blockStore; config.store.requireVerificationToBuy = blockStore; } if (message !== null) config.verification.message = message; return config; });
    await interaction.reply({ content: 'Configuração de verificação atualizada.', ephemeral: true });
  },
};
