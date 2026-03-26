import { createId } from '../utils/ids.js';

export class ModerationService {
  constructor(repositories, logService) { this.repositories = repositories; this.logService = logService; }
  async warn(guild, moderator, user, reason) {
    const warn = { id: createId('WARN'), guildId: guild.id, userId: user.id, moderatorId: moderator.id, reason, createdAt: new Date().toISOString() };
    await this.repositories.warns.create(warn);
    await this.logService.moderation(guild, 'Warn', user.tag, moderator.tag, reason);
    return warn;
  }
  async listWarns(guildId, userId) { const warns = await this.repositories.warns.listByGuild(guildId); return warns.filter((item) => item.userId === userId); }
}
