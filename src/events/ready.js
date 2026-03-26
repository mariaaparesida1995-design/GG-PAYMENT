export default { name: 'ready', once: true, async execute(client) { client.logger.info(`Bot online como ${client.user.tag}`); } };
