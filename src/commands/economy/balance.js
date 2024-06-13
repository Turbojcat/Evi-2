// src/commands/economy/balance.js
const { getBalance, getEcoSetting } = require('../../database/ecodb');

module.exports = {
  name: 'balance',
  description: 'Displays the user\'s balance',
  usage: '[user]',
  aliases: ['bal'],
  permissions: [],
  execute: async (message, args) => {
    const user = message.mentions.users.first() || message.author;

    try {
      const balance = await getBalance(message.guild.id, user.id);
      const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');
      message.channel.send(`${user}'s balance: ${balance} ${coinSymbol}`);
    } catch (error) {
      console.error('Error getting balance:', error);
      message.channel.send('An error occurred while retrieving the balance.');
    }
  },
  data: {
    name: 'balance',
    description: 'Displays the user\'s balance',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to display the balance for',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;

    try {
      const balance = await getBalance(interaction.guild.id, user.id);
      const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');
      interaction.followUp(`${user}'s balance: ${balance} ${coinSymbol}`);
    } catch (error) {
      console.error('Error getting balance:', error);
      interaction.followUp('An error occurred while retrieving the balance.');
    }
  },
};
