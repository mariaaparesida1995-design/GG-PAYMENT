import { AttachmentBuilder } from 'discord.js';

export async function createTranscriptAttachment(channel, fileName = `transcript-${channel.id}.txt`) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const lines = [...messages.values()]
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map((message) => {
      const attachmentUrls = [...message.attachments.values()].map((item) => item.url).join(', ');
      const content = [message.content, attachmentUrls].filter(Boolean).join(' | ') || '[mensagem sem texto]';
      return `[${new Date(message.createdTimestamp).toISOString()}] ${message.author.tag}: ${content}`;
    });

  return new AttachmentBuilder(Buffer.from(lines.join('\n'), 'utf8'), { name: fileName });
}
