// src/commands/economy/setBalance.js

const { setBalance } = require('../../database/database');

module.exports = {
  name: 'setbalance',
  description: 'Sets a user\'s balance',
  usage: '<user> <amount>',
  aliases: ['setbal'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!user || isNaN(amount)) {
      return message.reply('Please provide a valid user and amount.');
    }

    await setBalance(message.guild.id, user.id, amount);
    message.reply(`Set ${user}'s balance to ${amount}.`);
  },
  data: {
    name: 'setbalance',
    description: 'Sets a user\'s balance',
    options: [
      {
        name: 'set',
        type: 1, // SUB_COMMAND
        description: 'Sets a user\'s balance',
        options: [
          {
            name: 'user',
            type: 6, // USER
            description: 'The user to set the balance for',
            required: true,
          },
          {
            name: 'amount',
            type: 10, // NUMBER
            description: 'The amount to set the balance to',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    await setBalance(interaction.guild.id, user.id, amount);
    interaction.reply(`Set ${user}'s balance to ${amount}.`);
  },
};