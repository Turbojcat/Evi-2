// src/commands/economy/balanceremove.js

const { removeBalance } = require('../../database/database');

module.exports = {
  name: 'balanceremove',
  description: 'Remove balance from a user',
  usage: '<user> <amount>',
  aliases: ['balremove'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!user || isNaN(amount)) {
      return message.reply('Please provide a valid user and amount.');
    }

    await removeBalance(message.guild.id, user.id, amount);
    message.reply(`${amount} Evi :coin: removed from ${user}`);
  },
  data: {
    name: 'balanceremove',
    description: 'Remove balance from a user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to remove balance from',
        required: true,
      },
      {
        name: 'amount',
        type: 10, // NUMBER
        description: 'The amount to remove',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    await removeBalance(interaction.guild.id, user.id, amount);
    interaction.reply(`${amount} Evi :coin: removed from ${user}`);
  },
};
