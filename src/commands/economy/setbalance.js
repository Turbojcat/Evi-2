// src/commands/economy/setbalance.js
const { setBalance, getEcoSetting } = require('../../database/ecodb');

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
      return message.channel.send('Please provide a valid user and amount.');
    }

    try {
      await setBalance(message.guild.id, user.id, amount);
      const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');
      message.channel.send(`Set ${user}'s balance to ${amount} ${coinSymbol}.`);
    } catch (error) {
      console.error('Error setting balance:', error);
      message.channel.send('An error occurred while setting the balance.');
    }
  },
  data: {
    name: 'setbalance',
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
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    try {
      await setBalance(interaction.guild.id, user.id, amount);
      const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');
      interaction.followUp(`Set ${user}'s balance to ${amount} ${coinSymbol}.`);
    } catch (error) {
      console.error('Error setting balance:', error);
      interaction.followUp('An error occurred while setting the balance.');
    }
  },
};
