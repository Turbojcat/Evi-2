// src/commands/economy/balanceadd.js

const { addBalance } = require('../../database/database');

module.exports = {
  name: 'balanceadd',
  description: 'Add balance to a user',
  usage: '<user> <amount>',
  aliases: ['baladd'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!user || isNaN(amount)) {
      return message.reply('Please provide a valid user and amount.');
    }

    await addBalance(message.guild.id, user.id, amount);
    message.reply(`${amount} Evi :coin: added to ${user}`);
  },
  data: {
    name: 'balanceadd',
    description: 'Add balance to a user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to add balance to',
        required: true,
      },
      {
        name: 'amount',
        type: 10, // NUMBER
        description: 'The amount to add',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    await addBalance(interaction.guild.id, user.id, amount);
    interaction.reply(`${amount} Evi :coin: added to ${user}`);
  },
};