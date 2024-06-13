// src/commands/economy/balanceremove.js
const { removeBalance, getEcoSetting } = require('../../database/ecodb');

module.exports = {
  name: 'balanceremove',
  description: 'Removes balance from a user\'s account',
  usage: '<user> <amount>',
  aliases: ['removebal'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const user = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!user || isNaN(amount)) {
      return message.channel.send('Please provide a valid user and amount.');
    }

    try {
      await removeBalance(message.guild.id, user.id, amount);
      const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');
      message.channel.send(`Removed ${amount} ${coinSymbol} from ${user}'s balance.`);
    } catch (error) {
      console.error('Error removing balance:', error);
      message.channel.send('An error occurred while removing balance.');
    }
  },
  data: {
    name: 'balanceremove',
    description: 'Removes balance from a user\'s account',
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
        description: 'The amount to remove from the balance',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    try {
      await removeBalance(interaction.guild.id, user.id, amount);
      const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');
      interaction.followUp(`Removed ${amount} ${coinSymbol} from ${user}'s balance.`);
    } catch (error) {
      console.error('Error removing balance:', error);
      interaction.followUp('An error occurred while removing balance.');
    }
  },
};
