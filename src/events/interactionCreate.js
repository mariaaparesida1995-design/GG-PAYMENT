import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
} from 'discord.js';
import { buildDashboardComponents } from '../ui/dashboard.js';
import { buildConfigEmbed, buildDashboardEmbed } from '../ui/embeds.js';
import { ensureAdmin, ensureStaff } from '../utils/permissions.js';
import { money, roleMention, channelMention } from '../utils/format.js';
import { createTranscriptAttachment } from '../utils/transcript.js';

function cyclePaymentMode(mode) {
  const values = ['hybrid', 'mercadopago', 'pix_manual'];
  const index = values.indexOf(mode);
  return values[(index + 1) % values.length];
}

function makeModal(customId, title, inputs) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
  for (const input of inputs) {
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(input.id)
          .setLabel(input.label)
          .setStyle(input.style ?? TextInputStyle.Short)
          .setRequired(input.required ?? false)
          .setPlaceholder(input.placeholder ?? '')
          .setValue(input.value ?? ''),
      ),
    );
  }
  return modal;
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    const ctx = client.ctx;

    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        return command.autocomplete(interaction, ctx);
      }
      return;
    }

    if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        return await command.execute(interaction, ctx);
      } catch (error) {
        client.logger.error(`Erro ao executar comando ${interaction.commandName}`, error);
        if (interaction.deferred || interaction.replied) {
          return interaction.editReply('Ocorreu um erro ao executar este comando.').catch(() => null);
        }
        return interaction.reply({ content: 'Ocorreu um erro ao executar este comando.', ephemeral: true }).catch(() => null);
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'geral:section') {
        const section = interaction.values[0];
        const config = await ctx.repositories.config.get(interaction.guildId);
        const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);

        const sections = {
          summary: buildDashboardEmbed(interaction.guild, config, stats),
          payments: buildConfigEmbed(
            '💳 Pagamentos',
            `Modo: **${config.payments.mode}**\nPIX manual: ${config.payments.pixManual.enabled}\nMercado Pago: ${ctx.services.mercadoPagoService.enabled}\nAprovação automática: ${config.payments.autoApprove}`,
            config,
          ),
          tickets: buildConfigEmbed(
            '🎫 Tickets',
            `Categoria: ${channelMention(config.tickets.categoryId)}\nStaff: ${roleMention(config.tickets.staffRoleId)}\nImpedir duplicado: ${config.tickets.preventDuplicates}`,
            config,
          ),
          visual: buildConfigEmbed(
            '🎨 Visual',
            `Cor principal: \`${config.visuals.primaryColor}\`\nFooter: ${config.visuals.footer}`,
            config,
          ),
          verification: buildConfigEmbed(
            '✅ Verificação',
            `Ativa: ${config.verification.enabled}\nCargo: ${roleMention(config.verification.roleId)}\nBloquear loja: ${config.verification.blockStoreUntilVerified}`,
            config,
          ),
          stats: buildConfigEmbed(
            '📊 Estatísticas',
            `Faturamento bruto: **${money(stats.grossRevenue)}**\nVendas: **${stats.totalSales}**\nAprovados: **${stats.approvedOrders}**\nCancelados: **${stats.cancelledOrders}**`,
            config,
          ),
        };

        return interaction.update({
          embeds: [sections[section] ?? sections.summary],
          components: buildDashboardComponents(config),
        });
      }

      if (interaction.customId.startsWith('panel:buy:')) {
        const productId = interaction.values[0];
        const config = await ctx.repositories.config.get(interaction.guildId);
        const product = await ctx.services.productService.get(productId);

        if (!config.store.open || config.store.maintenance) {
          return interaction.reply({ content: 'A loja está fechada ou em manutenção.', ephemeral: true });
        }

        if (
          config.store.requireVerificationToBuy &&
          config.verification.roleId &&
          !interaction.member.roles.cache.has(config.verification.roleId)
        ) {
          return interaction.reply({ content: 'Você precisa verificar sua conta antes de comprar.', ephemeral: true });
        }

        if (!product || product.guildId !== interaction.guildId || !product.active || product.hidden || product.archived) {
          return interaction.reply({ content: 'Produto indisponível.', ephemeral: true });
        }

        const noStock = !product.unlimitedStock && product.stock <= 0 && (!product.stockItems || !product.stockItems.length);
        if (noStock) {
          return interaction.reply({ content: 'Produto sem estoque.', ephemeral: true });
        }

        const order = await ctx.services.orderService.createOrder(
          interaction.guild,
          interaction.user,
          product,
          config,
          client.publicBaseUrl,
        );

        const ticketChannel = interaction.guild.channels.cache.get(order.ticketChannelId);
        return interaction.reply({
          content: `Pedido criado com sucesso: \`${order.id}\`\nTicket: ${ticketChannel ? `<#${ticketChannel.id}>` : '`não encontrado`'}`,
          ephemeral: true,
        });
      }
    }

    if (interaction.isRoleSelectMenu()) {
      const config = await ctx.repositories.config.get(interaction.guildId);
      if (!ensureAdmin(interaction, config)) {
        return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
      }
      const [roleId] = interaction.values;

      if (interaction.customId === 'setup:role:staff') {
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          current.tickets.staffRoleId = roleId;
          return current;
        });
        return interaction.reply({ content: `Cargo staff definido: <@&${roleId}>`, ephemeral: true });
      }

      if (interaction.customId === 'setup:role:verification') {
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          current.verification.roleId = roleId;
          current.verification.enabled = true;
          return current;
        });
        return interaction.reply({ content: `Cargo de verificação definido: <@&${roleId}>`, ephemeral: true });
      }
    }

    if (interaction.isChannelSelectMenu()) {
      const config = await ctx.repositories.config.get(interaction.guildId);
      if (!ensureAdmin(interaction, config)) {
        return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
      }
      const [channelId] = interaction.values;

      if (interaction.customId === 'setup:channel:logs') {
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          current.logs.channelId = channelId;
          return current;
        });
        return interaction.reply({ content: `Canal de logs definido: <#${channelId}>`, ephemeral: true });
      }

      if (interaction.customId === 'setup:channel:ticketsCategory') {
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          current.tickets.categoryId = channelId;
          return current;
        });
        return interaction.reply({ content: `Categoria de tickets definida: <#${channelId}>`, ephemeral: true });
      }
    }

    if (interaction.isMentionableSelectMenu()) {
      const config = await ctx.repositories.config.get(interaction.guildId);
      if (!ensureAdmin(interaction, config)) {
        return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
      }
      if (interaction.customId === 'setup:mentionable:stockAlert') {
        const [targetId] = interaction.values;
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          current.alerts.stockLowTargetId = targetId;
          return current;
        });
        return interaction.reply({ content: `Alerta de estoque agora aponta para <@${targetId}>.`, ephemeral: true });
      }
    }

    if (interaction.isButton()) {
      const config = interaction.guildId ? await ctx.repositories.config.get(interaction.guildId) : null;

      if (interaction.customId === 'verify:confirm') {
        try {
          await ctx.services.verificationService.verifyMember(interaction.member, config);
          return interaction.reply({ content: 'Conta verificada com sucesso.', ephemeral: true });
        } catch (error) {
          return interaction.reply({ content: error.message, ephemeral: true });
        }
      }

      if (interaction.customId.startsWith('geral:toggle:')) {
        if (!ensureAdmin(interaction, config)) {
          return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
        }
        const toggle = interaction.customId.split(':')[2];
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          if (toggle === 'store') current.store.open = !current.store.open;
          if (toggle === 'maintenance') current.store.maintenance = !current.store.maintenance;
          if (toggle === 'paymentMode') current.payments.mode = cyclePaymentMode(current.payments.mode);
          return current;
        });
        const fresh = await ctx.repositories.config.get(interaction.guildId);
        const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);
        return interaction.update({
          embeds: [buildDashboardEmbed(interaction.guild, fresh, stats)],
          components: buildDashboardComponents(fresh),
        });
      }

      if (interaction.customId === 'geral:modal:pix') {
        if (!ensureAdmin(interaction, config)) {
          return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
        }
        return interaction.showModal(
          makeModal('geral:submit:pix', 'Editar PIX manual', [
            { id: 'key', label: 'Chave PIX', value: config.payments.pixManual.key },
            { id: 'receiver', label: 'Nome do recebedor', value: config.payments.pixManual.receiverName },
            { id: 'copyPaste', label: 'Copia e cola', style: TextInputStyle.Paragraph, value: config.payments.pixManual.copyPaste },
            { id: 'message', label: 'Mensagem', style: TextInputStyle.Paragraph, value: config.payments.pixManual.message },
          ]),
        );
      }

      if (interaction.customId === 'geral:modal:visual') {
        if (!ensureAdmin(interaction, config)) {
          return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
        }
        return interaction.showModal(
          makeModal('geral:submit:visual', 'Editar visual', [
            { id: 'primaryColor', label: 'Cor principal (número)', value: String(config.visuals.primaryColor) },
            { id: 'footer', label: 'Footer', value: config.visuals.footer },
            { id: 'bannerUrl', label: 'Banner URL', value: config.visuals.bannerUrl },
            { id: 'thumbnailUrl', label: 'Thumbnail URL', value: config.visuals.thumbnailUrl },
          ]),
        );
      }

      if (interaction.customId.startsWith('ticket:claim:')) {
        if (!ensureStaff(interaction, config)) {
          return interaction.reply({ content: 'Apenas staff.', ephemeral: true });
        }
        const ticketId = interaction.customId.split(':')[2];
        await ctx.services.ticketService.claim(ticketId, interaction.user.id);
        return interaction.reply({ content: `Ticket assumido por ${interaction.user}.`, ephemeral: false });
      }

      if (interaction.customId.startsWith('ticket:close:')) {
        if (!ensureStaff(interaction, config)) {
          return interaction.reply({ content: 'Apenas staff.', ephemeral: true });
        }
        const ticketId = interaction.customId.split(':')[2];
        await ctx.services.ticketService.close(ticketId, `Fechado por ${interaction.user.tag}`);
        await interaction.channel.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, { SendMessages: false }).catch(() => null);
        return interaction.reply({ content: 'Ticket fechado.', ephemeral: false });
      }

      if (interaction.customId.startsWith('ticket:transcript:')) {
        if (!ensureStaff(interaction, config)) {
          return interaction.reply({ content: 'Apenas staff.', ephemeral: true });
        }
        const attachment = await createTranscriptAttachment(interaction.channel);
        return interaction.reply({ content: 'Transcript gerado.', files: [attachment], ephemeral: true });
      }

      if (interaction.customId.startsWith('payment:refresh:')) {
        const orderId = interaction.customId.split(':')[2];
        if (!ctx.runtime.lockRefresh(orderId)) {
          return interaction.reply({ content: 'Atualização já em andamento.', ephemeral: true });
        }
        try {
          await interaction.deferReply({ ephemeral: true });
          const fresh = await ctx.services.orderService.refreshPayment(orderId, interaction.guild);
          if (fresh.paymentStatus === 'approved' && config.payments.autoApprove) {
            await ctx.services.orderService.deliver(orderId, interaction.guild, config).catch(() => null);
          }
          return interaction.editReply(`Status atualizado: **${fresh.paymentStatus}**`);
        } finally {
          ctx.runtime.unlockRefresh(orderId);
        }
      }

      if (interaction.customId.startsWith('payment:resend:')) {
        const orderId = interaction.customId.split(':')[2];
        const order = await ctx.services.orderService.get(orderId);
        if (!order) return interaction.reply({ content: 'Pedido não encontrado.', ephemeral: true });
        return interaction.reply({
          content: `Reenvio do pagamento para \`${order.id}\`\n\`\`\`\n${order.qrText || 'Sem QR salvo.'}\n\`\`\``,
          ephemeral: true,
        });
      }

      if (interaction.customId.startsWith('payment:cancel:')) {
        if (!ensureStaff(interaction, config)) {
          return interaction.reply({ content: 'Apenas staff.', ephemeral: true });
        }
        const orderId = interaction.customId.split(':')[2];
        const cancelled = await ctx.services.orderService.cancel(orderId, interaction.guild);
        return interaction.reply({ content: `Cobrança cancelada: ${cancelled.id}`, ephemeral: false });
      }

      if (interaction.customId.startsWith('payment:approve:')) {
        if (!ensureStaff(interaction, config)) {
          return interaction.reply({ content: 'Apenas staff.', ephemeral: true });
        }
        const orderId = interaction.customId.split(':')[2];
        const approved = await ctx.services.orderService.approve(orderId, interaction.guild, `Aprovado manualmente por ${interaction.user.tag}`);
        if (config.payments.autoApprove) {
          await ctx.services.orderService.deliver(orderId, interaction.guild, config).catch(() => null);
        }
        return interaction.reply({ content: `Pedido aprovado: ${approved.id}`, ephemeral: false });
      }
    }

    if (interaction.isModalSubmit()) {
      const config = await ctx.repositories.config.get(interaction.guildId);
      if (!ensureAdmin(interaction, config)) {
        return interaction.reply({ content: 'Sem permissão.', ephemeral: true });
      }

      if (interaction.customId === 'geral:submit:pix') {
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          current.payments.pixManual.key = interaction.fields.getTextInputValue('key');
          current.payments.pixManual.receiverName = interaction.fields.getTextInputValue('receiver');
          current.payments.pixManual.copyPaste = interaction.fields.getTextInputValue('copyPaste');
          current.payments.pixManual.message = interaction.fields.getTextInputValue('message');
          return current;
        });
        const fresh = await ctx.repositories.config.get(interaction.guildId);
        const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);
        return interaction.reply({
          content: 'PIX manual atualizado.',
          embeds: [buildDashboardEmbed(interaction.guild, fresh, stats)],
          components: buildDashboardComponents(fresh),
          ephemeral: true,
        });
      }

      if (interaction.customId === 'geral:submit:visual') {
        await ctx.repositories.config.patch(interaction.guildId, (current) => {
          const primary = Number(interaction.fields.getTextInputValue('primaryColor'));
          current.visuals.primaryColor = Number.isFinite(primary) ? primary : current.visuals.primaryColor;
          current.visuals.footer = interaction.fields.getTextInputValue('footer');
          current.visuals.bannerUrl = interaction.fields.getTextInputValue('bannerUrl');
          current.visuals.thumbnailUrl = interaction.fields.getTextInputValue('thumbnailUrl');
          return current;
        });
        const fresh = await ctx.repositories.config.get(interaction.guildId);
        const stats = await ctx.services.statsService.getGuildStats(interaction.guildId);
        return interaction.reply({
          content: 'Visual atualizado.',
          embeds: [buildDashboardEmbed(interaction.guild, fresh, stats)],
          components: buildDashboardComponents(fresh),
          ephemeral: true,
        });
      }
    }
  },
};
