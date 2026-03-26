import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export class VerificationService {
  constructor(repositories, logService) { this.repositories = repositories; this.logService = logService; }
  async sendPanel(channel, guildConfig) {
    const embed = new EmbedBuilder().setColor(guildConfig.visuals.primaryColor).setTitle('✅ Verificação').setDescription(guildConfig.verification.message).setFooter({ text: guildConfig.visuals.footer }).setTimestamp();
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('verify:confirm').setLabel('Verificar').setStyle(ButtonStyle.Success));
    return channel.send({ embeds: [embed], components: [row] });
  }
  async verifyMember(member, guildConfig) {
    if (!guildConfig.verification.roleId) throw new Error('Cargo de verificação não configurado.');
    await member.roles.add(guildConfig.verification.roleId);
    await this.logService.send(member.guild, 'verification', '✅ Usuário verificado', [
      { name: 'Usuário', value: `<@${member.id}>`, inline: true },
      { name: 'Cargo', value: `<@&${guildConfig.verification.roleId}>`, inline: true },
    ], 0x57f287);
  }
}
