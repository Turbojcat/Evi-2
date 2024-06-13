// src/commands/economy/balanceadd.js
const { addBalance, getEcoSetting } = require('../../database/ecodb');

module.exports = {
  name: 'balanceadd',
  description: 'Adds balance to a user\'s account',
  usage: '<user> <amount>',
  aliases: ['addbal'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!user || isNaN(amount)) {
      return message.channel.send('Please provide a valid user and amount.');
    }

    try {
      await addBalance(message.guild.id, user.id, amount);
      const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');
      message.channel.send(`Added ${amount} ${coinSymbol} to ${user}'s balance.`);
    } catch (error) {
      console.error('Error adding balance:', error);
      message.channel.send('An error occurred while adding balance.');
    }
  },
  data: {
    name: 'balanceadd',
    description: 'Adds balance to a user\'s account',
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
        description: 'The amount to add to the balance',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    try {
      await addBalance(interaction.guild.id, user.id, amount);
      const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');
      interaction.followUp(`Added ${amount} ${coinSymbol} to ${user}'s balance.`);
    } catch (error) {
      console.error('Error adding balance:', error);
      interaction.followUp('An error occurred while adding balance.');
    }
  },
};
