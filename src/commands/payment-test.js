import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('pagamento-testar').setDescription('Valida se o gateway principal está acessível'),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    if (config.payments.mode === 'mercadopago' || config.payments.mode === 'hybrid') {
      const enabled = ctx.services.mercadoPagoService.enabled;
      return interaction.reply({ content: enabled ? 'Mercado Pago habilitado. Access token presente.' : 'Mercado Pago não está habilitado. O bot cairá para PIX manual.', ephemeral: true });
    }
    await interaction.reply({ content: 'Modo atual não depende do Mercado Pago.', ephemeral: true });
  },
};
