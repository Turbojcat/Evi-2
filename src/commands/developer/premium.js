// src/commands/developer/premium.js
const { addPremiumSubscription, removePremiumSubscription } = require('../../database/database');

const parseDuration = (durationString) => {
  const durationRegex = /(\d+)([mdy])/g;
  let match;
  const duration = {};

  while ((match = durationRegex.exec(durationString)) !== null) {
    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'm':
        duration.minutes = amount;
        break;
      case 'd':
        duration.days = amount;
        break;
      case 'y':
        duration.years = amount;
        break;
    }
  }

  return duration;
};

module.exports = {
  name: 'premium',
  description: 'Manages premium subscriptions (developer only)',
  usage: '<add|remove> <user> [duration]',
  permissions: [],
  execute: async (message, args) => {
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    const subcommand = args[0];
    const userInput = args[1];
    const durationString = args[2];

    if (!subcommand || !userInput) {
      return message.reply('Please provide a subcommand (add/remove) and a username, user ID, or user tag.');
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
      return message.reply('Invalid user. Please provide a valid username, user ID, or user tag.');
    }

    const guild = message.client.guilds.cache.first();
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return message.reply('User not found in the server.');
    }

    if (subcommand === 'add') {
      const duration = durationString ? parseDuration(durationString) : { years: 1 };
      const endDate = new Date();

      if (duration.minutes) {
        endDate.setMinutes(endDate.getMinutes() + duration.minutes);
      }
      if (duration.days) {
        endDate.setDate(endDate.getDate() + duration.days);
      }
      if (duration.years) {
        endDate.setFullYear(endDate.getFullYear() + duration.years);
      }

      await addPremiumSubscription(userId, endDate);

      message.reply(`Added <@${userId}> to premium until ${endDate.toISOString().slice(0, 10)}.`);
    } else if (subcommand === 'remove') {
      await removePremiumSubscription(userId);

      message.reply(`Removed <@${userId}> from premium.`);
    } else {
      message.reply('Invalid subcommand. Please use "add" or "remove".');
    }
  },
  data: {
    name: 'premium',
    description: 'Manages premium subscriptions (developer only)',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds a user to premium subscription',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The username, user ID, or user tag of the user to add to premium',
            required: true,
          },
          {
            name: 'duration',
            type: 3, // STRING
            description: 'The duration of the premium subscription (e.g., 1m2d3y)',
            required: false,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes a user from premium subscription',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The username, user ID, or user tag of the user to remove from premium',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({ content: 'This command is only available for developers.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const userInput = interaction.options.getString('user');
    const durationString = interaction.options.getString('duration');

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
      return interaction.reply({ content: 'Invalid user. Please provide a valid username, user ID, or user tag.', ephemeral: true });
    }

    const guild = interaction.client.guilds.cache.first();
    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) {
      return interaction.reply({ content: 'User not found in the server.', ephemeral: true });
    }

    if (subcommand === 'add') {
      const duration = durationString ? parseDuration(durationString) : { years: 1 };
      const endDate = new Date();

      if (duration.minutes) {
        endDate.setMinutes(endDate.getMinutes() + duration.minutes);
      }
      if (duration.days) {
        endDate.setDate(endDate.getDate() + duration.days);
      }
      if (duration.years) {
        endDate.setFullYear(endDate.getFullYear() + duration.years);
      }

      await addPremiumSubscription(userId, endDate);

      interaction.reply(`Added <@${userId}> to premium until ${endDate.toISOString().slice(0, 10)}.`);
    } else if (subcommand === 'remove') {
      await removePremiumSubscription(userId);

      interaction.reply(`Removed <@${userId}> from premium.`);
    }
  },
};
