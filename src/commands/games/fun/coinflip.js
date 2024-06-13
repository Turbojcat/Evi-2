// src/commands/games/fun/coinflip.js
const { getBalance, addBalance, removeBalance, getEcoSetting } = require('../../../database/ecodb');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  description: 'Flip a coin and bet on the outcome',
  usage: '<heads|tails> <amount>',
  aliases: ['cf'],
  permissions: [],
  execute: async (message, args) => {
    const choice = args[0];
    const amount = parseInt(args[1]);

    if (!choice || !amount || amount < 5) {
      return message.channel.send('Please provide a valid choice (heads or tails) and a bet amount greater than or equal to 5.');
    }

    const balance = await getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.channel.send('Insufficient balance for the bet.');
    }

    const coinSides = ['heads', 'tails'];
    const outcome = coinSides[Math.floor(Math.random() * coinSides.length)];

    const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('Coin Flip')
      .setDescription(`You chose: ${choice}\nOutcome: ${outcome}`)
      .setColor(outcome === choice.toLowerCase() ? '#00ff00' : '#ff0000')
      .setTimestamp();

    if (choice.toLowerCase() === outcome) {
      await addBalance(message.guild.id, message.author.id, amount);
      embed.addFields({ name: 'Result', value: `Congratulations! You won ${amount} ${coinSymbol}!` });
    } else {
      await removeBalance(message.guild.id, message.author.id, amount);
      embed.addFields({ name: 'Result', value: `Sorry, you lost ${amount} ${coinSymbol}. Better luck next time!` });
    }

    message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'coinflip',
    description: 'Flip a coin and bet on the outcome',
    options: [
      {
        name: 'choice',
        type: 3, // STRING
        description: 'The side of the coin to bet on (heads or tails)',
        required: true,
        choices: [
          {
            name: 'Heads',
            value: 'heads',
          },
          {
            name: 'Tails',
            value: 'tails',
          },
        ],
      },
      {
        name: 'amount',
        type: 10, // NUMBER
        description: 'The amount to bet',
        required: true,
        minValue: 5,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const choice = interaction.options.getString('choice');
    const amount = interaction.options.getNumber('amount');

    const balance = await getBalance(interaction.guild.id, interaction.user.id);
    if (balance < amount) {
      return interaction.followUp({ content: 'Insufficient balance for the bet.', ephemeral: true });
    }

    const coinSides = ['heads', 'tails'];
    const outcome = coinSides[Math.floor(Math.random() * coinSides.length)];

    const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('Coin Flip')
      .setDescription(`You chose: ${choice}\nOutcome: ${outcome}`)
      .setColor(outcome === choice.toLowerCase() ? '#00ff00' : '#ff0000')
      .setTimestamp();

    if (choice.toLowerCase() === outcome) {
      await addBalance(interaction.guild.id, interaction.user.id, amount);
      embed.addFields({ name: 'Result', value: `Congratulations! You won ${amount} ${coinSymbol}!` });
    } else {
      await removeBalance(interaction.guild.id, interaction.user.id, amount);
      embed.addFields({ name: 'Result', value: `Sorry, you lost ${amount} ${coinSymbol}. Better luck next time!` });
    }

    await interaction.followUp({ embeds: [embed] });
  },
};
