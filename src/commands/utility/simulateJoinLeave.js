// src/commands/utility/simulateJoinLeave.js
module.exports = {
  name: 'simulate',
  description: 'Simulates the user joining or leaving the server',
  usage: '<join|leave>',
  aliases: ['sim'],
  permissions: [],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];

    if (!subcommand) {
      return message.reply('Please provide a subcommand (join/leave).');
    }

    if (subcommand === 'join') {
      message.client.emit('guildMemberAdd', message.member);
      message.reply('Simulated you joining the server.');
    } else if (subcommand === 'leave') {
      message.client.emit('guildMemberRemove', message.member);
      message.reply('Simulated you leaving the server.');
    } else {
      message.reply('Invalid subcommand. Please use "join" or "leave".');
    }
  },
  data: {
    name: 'simulate',
    description: 'Simulates the user joining or leaving the server',
    options: [
      {
        name: 'join',
        type: 1, // SUB_COMMAND
        description: 'Simulates the user joining the server',
      },
      {
        name: 'leave',
        type: 1, // SUB_COMMAND
        description: 'Simulates the user leaving the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'join') {
      interaction.client.emit('guildMemberAdd', interaction.member);
      interaction.reply('Simulated you joining the server.');
    } else if (subcommand === 'leave') {
      interaction.client.emit('guildMemberRemove', interaction.member);
      interaction.reply('Simulated you leaving the server.');
    }
  },
};
