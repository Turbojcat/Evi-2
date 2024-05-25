// src/commands/developer/customCommandLimit.js
const { getCustomCommandLimit, setCustomCommandLimit } = require('../../database/database');
const { developerIDs } = require('../../config');

module.exports = {
  name: 'customcommandlimit',
  description: 'Manages the custom command limit for a server (developer only)',
  usage: '<add|remove> <serverID> <amount>',
  permissions: [],
  execute: async (message, args) => {
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    const subcommand = args[0];
    const serverID = args[1];
    const amount = parseInt(args[2]);

    if (!subcommand || !serverID || isNaN(amount)) {
      return message.reply('Please provide a valid subcommand (add/remove), server ID, and amount.');
    }

    if (subcommand === 'add') {
      const currentLimit = await getCustomCommandLimit(serverID);
      const newLimit = currentLimit + amount;
      await setCustomCommandLimit(serverID, newLimit);
      message.reply(`Custom command limit increased by ${amount} for server ${serverID}. New limit: ${newLimit}`);
    } else if (subcommand === 'remove') {
      const currentLimit = await getCustomCommandLimit(serverID);
      const newLimit = Math.max(currentLimit - amount, 0);
      await setCustomCommandLimit(serverID, newLimit);
      message.reply(`Custom command limit decreased by ${amount} for server ${serverID}. New limit: ${newLimit}`);
    } else {
      message.reply('Invalid subcommand. Please use "add" or "remove".');
    }
  },
};