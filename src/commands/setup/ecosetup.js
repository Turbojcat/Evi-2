// src/commands/setup/ecosetup.js
const { setEcoSetting } = require('../../database/ecodb');

module.exports = {
  name: 'ecosetup',
  description: 'Sets up the economy system',
  usage: '<daily|coinchange> [amount|symbol]',
  aliases: ['ecoconfig'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const value = args.slice(1).join(' ');

    if (subcommand === 'daily') {
      const dailyAmount = parseInt(value);

      if (isNaN(dailyAmount) || dailyAmount <= 0) {
        return message.channel.send('Please provide a valid daily reward amount.');
      }

      await setEcoSetting(message.guild.id, 'dailyAmount', dailyAmount);
      message.channel.send(`Daily reward amount set to ${dailyAmount}.`);
    } else if (subcommand === 'coinchange') {
      if (!value) {
        return message.channel.send('Please provide a coin symbol.');
      }

      const coinSymbol = value.trim();

      await setEcoSetting(message.guild.id, 'coinSymbol', coinSymbol);
      message.channel.send(`Coin symbol set to ${coinSymbol}.`);
    } else {
      message.channel.send('Invalid subcommand. Please use "daily" or "coinchange".');
    }
  },
  data: {
    name: 'ecosetup',
    description: 'Sets up the economy system',
    options: [
      {
        name: 'daily',
        type: 1, // SUB_COMMAND
        description: 'Sets the daily reward amount',
        options: [
          {
            name: 'amount',
            type: 10, // NUMBER
            description: 'The daily reward amount',
            required: true,
          },
        ],
      },
      {
        name: 'coinchange',
        type: 1, // SUB_COMMAND
        description: 'Sets the coin symbol',
        options: [
          {
            name: 'symbol',
            type: 3, // STRING
            description: 'The coin symbol',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const value = interaction.options.getNumber('amount') || interaction.options.getString('symbol');

    if (subcommand === 'daily') {
      const dailyAmount = value;

      if (dailyAmount <= 0) {
        return interaction.followUp('Please provide a valid daily reward amount.');
      }

      await setEcoSetting(interaction.guild.id, 'dailyAmount', dailyAmount);
      interaction.followUp(`Daily reward amount set to ${dailyAmount}.`);
    } else if (subcommand === 'coinchange') {
      const coinSymbol = value.trim();

      await setEcoSetting(interaction.guild.id, 'coinSymbol', coinSymbol);
      interaction.followUp(`Coin symbol set to ${coinSymbol}.`);
    }
  },
};
