// src/commands/developer/suggestionBlacklist.js
const { addSuggestionBlacklist, removeSuggestionBlacklist } = require('../../database/database');
const { blacklistLogChannelId, developerIDs } = require('../../config');

module.exports = {
  name: 'suggestionblacklist',
  description: 'Manage the suggestion blacklist (developer only)',
  usage: '<add|remove> <user> [reason]',
  aliases: ['suggestblacklist', 'sbl'],
  permissions: [],
  execute: async (message, args) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.channel.send('This command is only available for developers.');
    }

    const subcommand = args[0];
    const userInput = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!subcommand || !userInput) {
      return message.channel.send('Please provide a subcommand (add/remove) and a user.');
    }

    let userId;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      userId = userInput.slice(2, -1);
      if (userId.startsWith('!')) {
        userId = userId.slice(1);
      }
    } else if (!isNaN(userInput)) {
      userId = userInput;
    } else {
      const user = message.client.users.cache.find((user) => user.username === userInput || user.tag === userInput);
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return message.channel.send('Invalid user. Please provide a valid user mention, ID, username, or tag.');
    }

    const blacklistLogChannel = message.guild.channels.cache.get(blacklistLogChannelId);

    if (subcommand === 'add') {
      await addSuggestionBlacklist(userId, reason);
      message.channel.send(`User <@${userId}> has been added to the suggestion blacklist.`);

      if (blacklistLogChannel) {
        blacklistLogChannel.send(`User <@${userId}> has been added to the suggestion blacklist by ${message.author.tag}. Reason: ${reason}`);
      }
    } else if (subcommand === 'remove') {
      await removeSuggestionBlacklist(userId);
      message.channel.send(`User <@${userId}> has been removed from the suggestion blacklist.`);

      if (blacklistLogChannel) {
        blacklistLogChannel.send(`User <@${userId}> has been removed from the suggestion blacklist by ${message.author.tag}.`);
      }
    } else {
      message.channel.send('Invalid subcommand. Please use "add" or "remove".');
    }
  },
  data: {
    name: 'suggestionblacklist',
    description: 'Manage the suggestion blacklist (developer only)',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Add a user to the suggestion blacklist',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user to add to the blacklist',
            required: true,
          },
          {
            name: 'reason',
            type: 3, // STRING
            description: 'The reason for blacklisting the user',
            required: false,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Remove a user from the suggestion blacklist',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user to remove from the blacklist',
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
    const userInput = interaction.options.getString('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    let userId;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      userId = userInput.slice(2, -1);
      if (userId.startsWith('!')) {
        userId = userId.slice(1);
      }
    } else if (!isNaN(userInput)) {
      userId = userInput;
    } else {
      const user = interaction.client.users.cache.find((user) => user.username === userInput || user.tag === userInput);
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return interaction.reply({ content: 'Invalid user. Please provide a valid user mention, ID, username, or tag.', ephemeral: true });
    }

    const blacklistLogChannel = interaction.guild.channels.cache.get(blacklistLogChannelId);

    if (subcommand === 'add') {
      await addSuggestionBlacklist(userId, reason);
      interaction.reply(`User <@${userId}> has been added to the suggestion blacklist.`);

      if (blacklistLogChannel) {
        blacklistLogChannel.send(`User <@${userId}> has been added to the suggestion blacklist by ${interaction.user.tag}. Reason: ${reason}`);
      }
    } else if (subcommand === 'remove') {
      await removeSuggestionBlacklist(userId);
      interaction.reply(`User <@${userId}> has been removed from the suggestion blacklist.`);

      if (blacklistLogChannel) {
        blacklistLogChannel.send(`User <@${userId}> has been removed from the suggestion blacklist by ${interaction.user.tag}.`);
      }
    }
  },
};