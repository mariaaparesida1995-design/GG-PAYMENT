import { EmbedBuilder } from 'discord.js';
import { boolIcon, channelMention, money, roleMention, userMention } from '../utils/format.js';

export function buildDashboardEmbed(guild, guildConfig, stats) {
  return new EmbedBuilder()
    .setColor(guildConfig.visuals.primaryColor)
    .setTitle('⚙️ Central /geral')
    .setDescription('Painel premium de administração da loja. Use os botões e menus abaixo para navegar.')
    .addFields(
      { name: '🏬 Loja', value: `${boolIcon(guildConfig.store.open)} Aberta
${boolIcon(guildConfig.store.maintenance)} Manutenção`, inline: true },
      { name: '💳 Pagamentos', value: `Modo: **${guildConfig.payments.mode}**
MP: ${boolIcon(guildConfig.payments.mercadopago.enabled)}
PIX manual: ${boolIcon(guildConfig.payments.pixManual.enabled)}`, inline: true },
      { name: '🎫 Tickets', value: `Categoria: ${channelMention(guildConfig.tickets.categoryId)}
Staff: ${roleMention(guildConfig.tickets.staffRoleId)}`, inline: true },
      { name: '✅ Verificação', value: `${boolIcon(guildConfig.verification.enabled)} Ativa
Cargo: ${roleMention(guildConfig.verification.roleId)}`, inline: true },
      { name: '📊 Resumo', value: `Vendas: **${stats.totalSales}**
Aprovados: **${stats.approvedOrders}**
Faturamento: **${money(stats.grossRevenue)}**`, inline: true },
      { name: '📡 Logs', value: `Canal: ${channelMention(guildConfig.logs.channelId)}
Alerta estoque: ${userMention(guildConfig.alerts.stockLowTargetId)}`, inline: true },
    )
    .setFooter({ text: guildConfig.visuals.footer })
    .setTimestamp();
}

export function buildConfigEmbed(title, description, guildConfig) {
  return new EmbedBuilder().setColor(guildConfig.visuals.primaryColor).setTitle(title).setDescription(description).setFooter({ text: guildConfig.visuals.footer }).setTimestamp();
}
