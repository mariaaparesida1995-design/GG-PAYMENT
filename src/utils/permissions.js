import { PermissionFlagsBits } from 'discord.js';

export function isAdmin(member, guildConfig) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  return (guildConfig.security.adminRoleIds ?? []).some((roleId) => member.roles.cache.has(roleId));
}
export function isStaff(member, guildConfig) {
  if (!member) return false;
  if (isAdmin(member, guildConfig)) return true;
  return guildConfig.tickets.staffRoleId && member.roles.cache.has(guildConfig.tickets.staffRoleId);
}
export function ensureAdmin(interaction, guildConfig) { return isAdmin(interaction.member, guildConfig); }
export function ensureStaff(interaction, guildConfig) { return isStaff(interaction.member, guildConfig); }
