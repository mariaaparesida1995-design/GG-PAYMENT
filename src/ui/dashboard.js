import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, MentionableSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder } from 'discord.js';

export function buildDashboardComponents(guildConfig) {
  const pages = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId('geral:section').setPlaceholder('Navegue pelas áreas do sistema').addOptions(
      { label: 'Resumo', value: 'summary', description: 'Visão geral da loja' },
      { label: 'Pagamentos', value: 'payments', description: 'PIX manual e Mercado Pago' },
      { label: 'Tickets', value: 'tickets', description: 'Fluxo de atendimento e compra' },
      { label: 'Visual', value: 'visual', description: 'Cores, imagens e mensagens' },
      { label: 'Verificação', value: 'verification', description: 'Bloqueio até verificar' },
      { label: 'Estatísticas', value: 'stats', description: 'Métricas e faturamento' },
    ),
  );
  const toggles = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('geral:toggle:store').setLabel(guildConfig.store.open ? 'Fechar loja' : 'Abrir loja').setStyle(guildConfig.store.open ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder().setCustomId('geral:toggle:maintenance').setLabel(guildConfig.store.maintenance ? 'Desativar manutenção' : 'Ativar manutenção').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('geral:toggle:paymentMode').setLabel('Alternar modo de pagamento').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('geral:modal:pix').setLabel('Editar PIX manual').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('geral:modal:visual').setLabel('Editar visual').setStyle(ButtonStyle.Secondary),
  );
  const setup = new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId('setup:role:staff').setPlaceholder('Selecionar cargo da staff').setMinValues(1).setMaxValues(1));
  const setup2 = new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId('setup:role:verification').setPlaceholder('Selecionar cargo de verificação').setMinValues(1).setMaxValues(1));
  const setup3 = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('setup:channel:logs').setPlaceholder('Selecionar canal de logs').setChannelTypes(ChannelType.GuildText).setMinValues(1).setMaxValues(1));
  const setup4 = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('setup:channel:ticketsCategory').setPlaceholder('Selecionar categoria de tickets').setChannelTypes(ChannelType.GuildCategory).setMinValues(1).setMaxValues(1));
  const setup5 = new ActionRowBuilder().addComponents(new MentionableSelectMenuBuilder().setCustomId('setup:mentionable:stockAlert').setPlaceholder('Selecionar alvo de alerta de estoque').setMinValues(1).setMaxValues(1));
  return [pages, toggles, setup, setup2, setup3, setup4, setup5];
}

