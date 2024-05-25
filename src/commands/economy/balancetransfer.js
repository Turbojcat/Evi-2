// src/commands/economy/balancetransfer.js

const { getBalance, addBalance, removeBalance } = require('../../database/database');

module.exports = {
  name: 'balancetransfer',
  description: 'Transfers Evi coins from your balance to another user',
  usage: '<user> <amount>',
  aliases: ['transfer', 'send'],
  permissions: [],
  permissionLevel: ['normal'],
  execute: async (message, args) => {
    const recipient = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!recipient || isNaN(amount) || amount <= 0) {
      return message.reply('Please provide a valid user and a positive amount to transfer.');
    }

    const senderBalance = await getBalance(message.guild.id, message.author.id);

    if (senderBalance < amount) {
      return message.reply('You do not have enough Evi coins to make this transfer.');
    }

    await removeBalance(message.guild.id, message.author.id, amount);
    await addBalance(message.guild.id, recipient.id, amount);

    message.reply(`Successfully transferred ${amount} Evi :coin: to ${recipient.username}.`);
  },
  data: {
    name: 'balancetransfer',
    description: 'Transfers Evi coins from your balance to another user',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to transfer Evi coins to',
        required: true,
      },
      {
        name: 'amount',
        type: 10, // NUMBER
        description: 'The amount of Evi coins to transfer',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getNumber('amount');

    if (amount <= 0) {
      return interaction.reply({ content: 'Please provide a positive amount to transfer.', ephemeral: true });
    }

    const senderBalance = await getBalance(interaction.guild.id, interaction.user.id);

    if (senderBalance < amount) {
      return interaction.reply({ content: 'You do not have enough Evi coins to make this transfer.', ephemeral: true });
    }

    await removeBalance(interaction.guild.id, interaction.user.id, amount);
    await addBalance(interaction.guild.id, recipient.id, amount);

    interaction.reply(`Successfully transferred ${amount} Evi :coin: to ${recipient.username}.`);
  },
};
