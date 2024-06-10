// src/commands/utility/simulateJoinLeave.js
module.exports = {
  name: 'simulate',
  description: 'Simulates a user joining or leaving the server',
  usage: '<join|leave> <user>',
  aliases: ['sim'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['moderator'],
  premium: true,
  execute: async (message, args) => {
    const subcommand = args[0];
    const userInput = args[1];

    if (!subcommand || !userInput) {
      return;
    }

    let user;

    if (userInput.startsWith('<@') && userInput.endsWith('>')) {
      const userId = userInput.slice(2, -1);
      user = await message.client.users.fetch(userId);
    } else {
      user = message.client.users.cache.find((u) => u.username === userInput || u.tag === userInput);
    }

    if (!user) {
      return;
    }

    if (subcommand === 'join') {
      message.client.emit('guildMemberAdd', message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id));
    } else if (subcommand === 'leave') {
      message.client.emit('guildMemberRemove', message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id));
    }
  },
  data: {
    name: 'simulate',
    description: 'Simulates a user joining or leaving the server',
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
      return;
    }

    if (subcommand === 'join') {
      interaction.client.emit('guildMemberAdd', interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id));
    } else if (subcommand === 'leave') {
      interaction.client.emit('guildMemberRemove', interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id));
    }
  },
};
