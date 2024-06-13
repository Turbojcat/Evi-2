// src/commands/developer/premium.js
const { addPremiumSubscription, removePremiumSubscription, hasPremiumSubscription } = require('../../database/database');
const { developerIDs } = require('../../config');

module.exports = {
  name: 'premium',
  description: 'Manages premium subscriptions',
  usage: '<add|remove|check> <user> [duration]',
  aliases: ['p'],
  permissions: [],
  permissionLevel: ['developer'],
  execute: async (message, args) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const subcommand = args[0];

    if (subcommand === 'add') {
      const userInput = args[1];
      const duration = args[2];

      if (!userInput) {
        return message.channel.send('Please provide a user tag or user ID to add the premium subscription to.');
      }

      let user;

      if (userInput.startsWith('<@') && userInput.endsWith('>')) {
        const userId = userInput.slice(2, -1);
        user = await message.client.users.fetch(userId);
      } else {
        user = message.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
      }

      if (!user) {
        return message.channel.send('Invalid user tag or user ID. Please provide a valid user.');
      }

      const existingSubscription = await hasPremiumSubscription(user.id);
      if (existingSubscription) {
        return message.channel.send(`${user.tag} (ID: ${user.id}) already has an active premium subscription.`);
      }

      let endDate = null;
      if (duration) {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(duration));
      }

      try {
        await addPremiumSubscription(user.id, endDate);
        if (endDate) {
          message.channel.send(`Premium subscription added for ${user.tag} (ID: ${user.id}) with duration ${duration} days.`);
        } else {
          message.channel.send(`Permanent premium subscription added for ${user.tag} (ID: ${user.id}).`);
        }
      } catch (error) {
        console.error('Error adding premium subscription:', error);
        message.channel.send('An error occurred while adding the premium subscription.');
      }
    } else if (subcommand === 'remove') {
      const userInput = args[1];

      if (!userInput) {
        return message.channel.send('Please provide a user tag or user ID to remove the premium subscription from.');
      }

      let user;

      if (userInput.startsWith('<@') && userInput.endsWith('>')) {
        const userId = userInput.slice(2, -1);
        user = await message.client.users.fetch(userId);
      } else {
        user = message.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
      }

      if (!user) {
        return message.channel.send('Invalid user tag or user ID. Please provide a valid user.');
      }

      try {
        await removePremiumSubscription(user.id);
        message.channel.send(`Premium subscription removed for ${user.tag} (ID: ${user.id}).`);
      } catch (error) {
        console.error('Error removing premium subscription:', error);
        message.channel.send('An error occurred while removing the premium subscription.');
      }
    } else if (subcommand === 'check') {
      const userInput = args[1];

      if (!userInput) {
        return message.channel.send('Please provide a user tag or user ID to check the premium subscription for.');
      }

      let user;

      if (userInput.startsWith('<@') && userInput.endsWith('>')) {
        const userId = userInput.slice(2, -1);
        user = await message.client.users.fetch(userId);
      } else {
        user = message.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
      }

      if (!user) {
        return message.channel.send('Invalid user tag or user ID. Please provide a valid user.');
      }

      const hasPremium = await hasPremiumSubscription(user.id);

      if (hasPremium) {
        message.channel.send(`${user.tag} (ID: ${user.id}) has an active premium subscription.`);
      } else {
        message.channel.send(`${user.tag} (ID: ${user.id}) does not have an active premium subscription.`);
      }
    } else {
      message.channel.send('Invalid subcommand. Please use "add", "remove", or "check".');
    }
  },
  data: {
    name: 'premium',
    description: 'Manages premium subscriptions',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds a premium subscription to a user',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user tag or user ID to add the premium subscription to',
            required: true,
          },
          {
            name: 'duration',
            type: 3, // STRING
            description: 'The duration of the premium subscription in days (optional)',
            required: false,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes a premium subscription from a user',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user tag or user ID to remove the premium subscription from',
            required: true,
          },
        ],
      },
      {
        name: 'check',
        type: 1, // SUB_COMMAND
        description: 'Checks if a user has an active premium subscription',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user tag or user ID to check the premium subscription for',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const userInput = interaction.options.getString('user');
      const duration = interaction.options.getString('duration');

      let user;

      if (userInput.startsWith('<@') && userInput.endsWith('>')) {
        const userId = userInput.slice(2, -1);
        user = await interaction.client.users.fetch(userId);
      } else {
        user = interaction.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
      }

      if (!user) {
        return interaction.channel.send('Invalid user tag or user ID. Please provide a valid user.');
      }

      const existingSubscription = await hasPremiumSubscription(user.id);
      if (existingSubscription) {
        return interaction.channel.send(`${user.tag} (ID: ${user.id}) already has an active premium subscription.`);
      }

      let endDate = null;
      if (duration) {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(duration));
      }

      try {
        await addPremiumSubscription(user.id, endDate);
        if (endDate) {
          interaction.channel.send(`Premium subscription added for ${user.tag} (ID: ${user.id}) with duration ${duration} days.`);
        } else {
          interaction.channel.send(`Permanent premium subscription added for ${user.tag} (ID: ${user.id}).`);
        }
      } catch (error) {
        console.error('Error adding premium subscription:', error);
        interaction.channel.send('An error occurred while adding the premium subscription.');
      }
    } else if (subcommand === 'remove') {
      const userInput = interaction.options.getString('user');

      let user;

      if (userInput.startsWith('<@') && userInput.endsWith('>')) {
        const userId = userInput.slice(2, -1);
        user = await interaction.client.users.fetch(userId);
      } else {
        user = interaction.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
      }

      if (!user) {
        return interaction.channel.send('Invalid user tag or user ID. Please provide a valid user.');
      }

      try {
        await removePremiumSubscription(user.id);
        interaction.channel.send(`Premium subscription removed for ${user.tag} (ID: ${user.id}).`);
      } catch (error) {
        console.error('Error removing premium subscription:', error);
        interaction.channel.send('An error occurred while removing the premium subscription.');
      }
    } else if (subcommand === 'check') {
      const userInput = interaction.options.getString('user');

      let user;

      if (userInput.startsWith('<@') && userInput.endsWith('>')) {
        const userId = userInput.slice(2, -1);
        user = await interaction.client.users.fetch(userId);
      } else {
        user = interaction.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
      }

      if (!user) {
        return interaction.channel.send('Invalid user tag or user ID. Please provide a valid user.');
      }

      const hasPremium = await hasPremiumSubscription(user.id);

      if (hasPremium) {
        interaction.channel.send(`${user.tag} (ID: ${user.id}) has an active premium subscription.`);
      } else {
        interaction.channel.send(`${user.tag} (ID: ${user.id}) does not have an active premium subscription.`);
      }
    }
  },
};
