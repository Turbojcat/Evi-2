// src/commands/developer/wikipage.js
const { addWikiPages, removeWikiPages } = require('../../database/wiki');
const { developerIDs } = require('../../config');

module.exports = {
  name: 'wikipage',
  description: 'Adds or removes wiki pages for a server (developer only)',
  usage: '<add|remove> <amount> <serverID>',
  aliases: ['wp'],
  permissions: [],
  execute: async (message, args) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    const subcommand = args[0];
    const amount = parseInt(args[1]);
    const serverID = args[2];

    if (!subcommand || isNaN(amount) || !serverID) {
      return message.reply('Please provide a valid subcommand (add/remove), amount, and server ID.');
    }

    if (subcommand === 'add') {
      try {
        await addWikiPages(serverID, amount);
        message.reply(`Added ${amount} wiki page(s) for server ${serverID}.`);
      } catch (error) {
        console.error('Error adding wiki pages:', error);
        message.reply('An error occurred while adding wiki pages. Please check the server ID and try again.');
      }
    } else if (subcommand === 'remove') {
      try {
        await removeWikiPages(serverID, amount);
        message.reply(`Removed ${amount} wiki page(s) for server ${serverID}.`);
      } catch (error) {
        console.error('Error removing wiki pages:', error);
        message.reply('An error occurred while removing wiki pages. Please check the server ID and try again.');
      }
    } else {
      message.reply('Invalid subcommand. Please use "add" or "remove".');
    }
  },
  data: {
    name: 'wikipage',
    description: 'Adds or removes wiki pages for a server (developer only)',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds wiki pages for a server',
        options: [
          {
            name: 'amount',
            type: 4, // INTEGER
            description: 'The number of wiki pages to add',
            required: true,
          },
          {
            name: 'server',
            type: 3, // STRING
            description: 'The ID of the server to add wiki pages for',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes wiki pages for a server',
        options: [
          {
            name: 'amount',
            type: 4, // INTEGER
            description: 'The number of wiki pages to remove',
            required: true,
          },
          {
            name: 'server',
            type: 3, // STRING
            description: 'The ID of the server to remove wiki pages from',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({ content: 'This command is only available for developers.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger('amount');
    const serverID = interaction.options.getString('server');

    if (subcommand === 'add') {
      try {
        await addWikiPages(serverID, amount);
        interaction.reply(`Added ${amount} wiki page(s) for server ${serverID}.`);
      } catch (error) {
        console.error('Error adding wiki pages:', error);
        interaction.reply({ content: 'An error occurred while adding wiki pages. Please check the server ID and try again.', ephemeral: true });
      }
    } else if (subcommand === 'remove') {
      try {
        await removeWikiPages(serverID, amount);
        interaction.reply(`Removed ${amount} wiki page(s) for server ${serverID}.`);
      } catch (error) {
        console.error('Error removing wiki pages:', error);
        interaction.reply({ content: 'An error occurred while removing wiki pages. Please check the server ID and try again.', ephemeral: true });
      }
    }
  },
};
