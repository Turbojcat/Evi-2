// src/commands/moderation/modlog.js
const { getModerationLogs } = require('../../database/moderationdb');

module.exports = {
  name: 'modlog',
  description: 'Displays the moderation log',
  usage: '[page]',
  permissions: [],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const page = parseInt(args[0]) || 1;
    const logsPerPage = 10;

    const logs = await getModerationLogs(message.guild.id);

    if (logs.length === 0) {
      return message.channel.send('No moderation logs found.');
    }

    const totalPages = Math.ceil(logs.length / logsPerPage);

    if (page < 1 || page > totalPages) {
      return message.channel.send(`Invalid page number. Please provide a number between 1 and ${totalPages}.`);
    }

    const startIndex = (page - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const logsToDisplay = logs.slice(startIndex, endIndex);

    const logList = logsToDisplay.map((log, index) => {
      const moderator = message.guild.members.cache.get(log.moderator_id);
      const target = message.guild.members.cache.get(log.target_id);
      return `${startIndex + index + 1}. Action: ${log.action}, Moderator: ${moderator}, Target: ${target}, Reason: ${log.reason}, Date: ${new Date(log.timestamp).toLocaleString()}`;
    }).join('\n');

    message.channel.send(`Moderation Logs (Page ${page} of ${totalPages}):\n${logList}`);
  },
  data: {
    name: 'modlog',
    description: 'Displays the moderation log',
    options: [
      {
        name: 'page',
        type: 4, // INTEGER
        description: 'The page number of the moderation log to display',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const page = interaction.options.getInteger('page') || 1;
    const logsPerPage = 10;

    const logs = await getModerationLogs(interaction.guild.id);

    if (logs.length === 0) {
      return interaction.reply('No moderation logs found.');
    }

    const totalPages = Math.ceil(logs.length / logsPerPage);

    if (page < 1 || page > totalPages) {
      return interaction.reply(`Invalid page number. Please provide a number between 1 and ${totalPages}.`);
    }

    const startIndex = (page - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const logsToDisplay = logs.slice(startIndex, endIndex);

    const logList = logsToDisplay.map((log, index) => {
      const moderator = interaction.guild.members.cache.get(log.moderator_id);
      const target = interaction.guild.members.cache.get(log.target_id);
      return `${startIndex + index + 1}. Action: ${log.action}, Moderator: ${moderator}, Target: ${target}, Reason: ${log.reason}, Date: ${new Date(log.timestamp).toLocaleString()}`;
    }).join('\n');

    interaction.reply(`Moderation Logs (Page ${page} of ${totalPages}):\n${logList}`);
  },
};
