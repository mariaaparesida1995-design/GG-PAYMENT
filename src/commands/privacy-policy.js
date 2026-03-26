import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('politica-privacidade').setDescription('Mostra a política de privacidade do bot'),
  async execute(interaction, ctx) {
    const config = await ctx.repositories.config.get(interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor(config.visuals.primaryColor)
      .setTitle('📜 Política de Privacidade')
      .setDescription('Transparência sobre dados, pagamentos e responsabilidades do sistema.')
      .addFields(
        { name: 'Dados utilizados', value: 'IDs de usuários, IDs de canais, IDs de cargos, pedidos, tickets, histórico de estoque e configurações do servidor.' },
        { name: 'Pagamentos', value: 'Pagamentos podem usar PIX manual ou Mercado Pago. O bot registra status, referência externa e histórico do pedido.' },
        { name: 'Integrações', value: 'Integrações externas usam apenas as credenciais necessárias. O access token do Mercado Pago fica fora do Discord, em variável de ambiente.' },
        { name: 'Segurança', value: 'Comandos administrativos exigem permissões. Alterações sensíveis ficam em logs quando configurados.' },
        { name: 'Responsabilidade', value: 'A administração do servidor é responsável por validar produtos, conteúdo entregue e conformidade do uso do sistema.' },
      )
      .setFooter({ text: config.visuals.footer }).setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
