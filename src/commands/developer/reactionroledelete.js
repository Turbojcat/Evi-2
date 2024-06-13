// src/commands/developer/reactionroledelete.js
const { developerIDs } = require('../../config');
const { removeAllReactionRoles } = require('../../database/reactionroledb');

module.exports = {
  name: 'reactionroledelete',
  description: 'Deletes all reaction roles for a specific message on a server (developer only)',
  usage: '<server-id> <message-id>',
  aliases: ['rrd'],
  permissions: [],
  execute: async (message, args) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    const serverId = args[0];
    const messageId = args[1];

    if (!serverId || !messageId) {
      return message.reply('Please provide a server ID and message ID.');
    }

    try {
      await removeAllReactionRoles(serverId, messageId);
      message.reply(`All reaction roles for message ${messageId} on server ${serverId} have been deleted.`);
    } catch (error) {
      console.error('Error deleting reaction roles:', error);
      message.reply('An error occurred while deleting the reaction roles.');
    }
  },
  data: {
    name: 'reactionroledelete',
    description: 'Deletes all reaction roles for a specific message on a server (developer only)',
    options: [
      {
        name: 'server-id',
        type: 3, // STRING
        description: 'The ID of the server',
        required: true,
      },
      {
        name: 'message-id',
        type: 3, // STRING
        description: 'The ID of the message',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({ content: 'This command is only available for developers.', ephemeral: true });
    }

    const serverId = interaction.options.getString('server-id');
    const messageId = interaction.options.getString('message-id');

    try {
      await removeAllReactionRoles(serverId, messageId);
      interaction.reply(`All reaction roles for message ${messageId} on server ${serverId} have been deleted.`);
    } catch (error) {
      console.error('Error deleting reaction roles:', error);
      interaction.reply('An error occurred while deleting the reaction roles.');
    }
  },
};
