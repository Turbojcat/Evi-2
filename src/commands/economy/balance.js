// src/commands/economy/balance.js

const { getBalance } = require('../../database/database');

module.exports = {
  name: 'balance',
  description: 'Check a user\'s balance',
  usage: '[user]',
  aliases: ['bal'],
  permissions: [],
  permissionLevel: ['normal'],
  execute: async (message, args) => {
    const user = message.mentions.users.first() || message.author;
    const balance = await getBalance(message.guild.id, user.id);
    message.reply(`${user} you have ${balance} Evi :coin:`);
  },
  data: {
    name: 'balance',
    description: 'Check a user\'s balance',
    options: [
      {
        name: 'user',
        type: 6, // USER
        description: 'The user to check the balance of (optional)',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const balance = await getBalance(interaction.guild.id, user.id);
    interaction.reply(`${user} you have ${balance} Evi :coin:`);
  },
};