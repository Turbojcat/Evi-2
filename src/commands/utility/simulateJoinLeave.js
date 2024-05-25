// src/commands/utility/simulateJoinLeave.js
const { developerIDs } = require('../../config');

module.exports = {
  name: 'simulate',
  description: 'Simulates a user joining or leaving the server (developer only)',
  usage: '<join|leave> <user>',
  aliases: ['sim'],
  permissions: [],
  execute: async (message, args) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    const subcommand = args[0];
    const userInput = args[1];

    if (!subcommand || !userInput) {
      return message.reply('Please provide a subcommand (join/leave) and a user.');
    }

    let user;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      const userId = userInput.slice(2, -1);
      user = await message.client.users.fetch(userId);
    } else {
      user = message.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
    }

    if (!user) {
      return message.reply('Invalid user. Please provide a valid user mention, ID, username, or tag.');
    }

    if (subcommand === 'join') {
      message.client.emit('guildMemberAdd', message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id));
      message.reply(`Simulated user ${user.tag} joining the server.`);
    } else if (subcommand === 'leave') {
      message.client.emit('guildMemberRemove', message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id));
      message.reply(`Simulated user ${user.tag} leaving the server.`);
    } else {
      message.reply('Invalid subcommand. Please use "join" or "leave".');
    }
  },
  data: {
    name: 'simulate',
    description: 'Simulates a user joining or leaving the server (developer only)',
    options: [
      {
        name: 'join',
        type: 1, // SUB_COMMAND
        description: 'Simulates a user joining the server',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user to simulate joining the server',
            required: true,
          },
        ],
      },
      {
        name: 'leave',
        type: 1, // SUB_COMMAND
        description: 'Simulates a user leaving the server',
        options: [
          {
            name: 'user',
            type: 3, // STRING
            description: 'The user to simulate leaving the server',
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

    let user;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      const userId = userInput.slice(2, -1);
      user = await interaction.client.users.fetch(userId);
    } else {
      user = interaction.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
    }

    if (!user) {
      return interaction.reply({ content: 'Invalid user. Please provide a valid user mention, ID, username, or tag.', ephemeral: true });
    }

    if (subcommand === 'join') {
      interaction.client.emit('guildMemberAdd', interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id));
      interaction.reply(`Simulated user ${user.tag} joining the server.`);
    } else if (subcommand === 'leave') {
      interaction.client.emit('guildMemberRemove', interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id));
      interaction.reply(`Simulated user ${user.tag} leaving the server.`);
    }
  },
};