// src/commands/economy/balancetransfer.js
const { getBalance, addBalance, removeBalance, getEcoSetting } = require('../../database/ecodb');

module.exports = {
  name: 'balancetransfer',
  description: 'Transfers balance from one user to another',
  usage: '<user> <amount>',
  aliases: ['transfer'],
  permissions: [],
  execute: async (message, args) => {
    const sender = message.author;
    const recipient = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!recipient || isNaN(amount)) {
      return message.channel.send('Please provide a valid recipient and amount.');
    }

    try {
      const senderBalance = await getBalance(message.guild.id, sender.id);
      if (senderBalance < amount) {
        return message.channel.send('Insufficient balance for the transfer.');
      }

      await removeBalance(message.guild.id, sender.id, amount);
      await addBalance(message.guild.id, recipient.id, amount);

      const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');
      message.channel.send(`Transferred ${amount} ${coinSymbol} from ${sender} to ${recipient}.`);
    } catch (error) {
      console.error('Error transferring balance:', error);
      message.channel.send('An error occurred while transferring balance.');
    }
  },
  data: {
    name: 'balancetransfer',
    description: 'Transfers balance from one user to another',
    options: [
      {
        name: 'recipient',
        type: 6, // USER
        description: 'The user to transfer balance to',
        required: true,
      },
      {
        name: 'amount',
        type: 10, // NUMBER
        description: 'The amount to transfer',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const sender = interaction.user;
    const recipient = interaction.options.getUser('recipient');
    const amount = interaction.options.getNumber('amount');

    try {
      const senderBalance = await getBalance(interaction.guild.id, sender.id);
      if (senderBalance < amount) {
        return interaction.followUp('Insufficient balance for the transfer.');
      }

      await removeBalance(interaction.guild.id, sender.id, amount);
      await addBalance(interaction.guild.id, recipient.id, amount);

      const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');
      interaction.followUp(`Transferred ${amount} ${coinSymbol} from ${sender} to ${recipient}.`);
    } catch (error) {
      console.error('Error transferring balance:', error);
      interaction.followUp('An error occurred while transferring balance.');
    }
  },
};
