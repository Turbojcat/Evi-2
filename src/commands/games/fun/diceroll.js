// src/commands/games/fun/diceroll.js
const { getBalance, addBalance, removeBalance, getEcoSetting } = require('../../../database/ecodb');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'diceroll',
  description: 'Roll a dice and bet on the outcome',
  usage: '<number> <amount>',
  aliases: ['dr'],
  permissions: [],
  execute: async (message, args) => {
    const guess = parseInt(args[0]);
    const amount = parseInt(args[1]);

    if (!guess || !amount || amount < 5 || guess < 1 || guess > 6) {
      return message.channel.send('Please provide a valid guess (1-6) and a bet amount greater than or equal to 5.');
    }

    const balance = await getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.channel.send('Insufficient balance for the bet.');
    }

    const outcome = Math.floor(Math.random() * 6) + 1;

    const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('Dice Roll')
      .setDescription(`You guessed: ${guess}\nOutcome: ${outcome}`)
      .setColor(guess === outcome ? '#00ff00' : '#ff0000')
      .setTimestamp();

    if (guess === outcome) {
      const multiplier = 6;
      const winnings = amount * multiplier;
      await addBalance(message.guild.id, message.author.id, winnings);
      embed.addFields({ name: 'Result', value: `Congratulations! You rolled a ${outcome} and won ${winnings} ${coinSymbol}!` });
    } else {
      await removeBalance(message.guild.id, message.author.id, amount);
      embed.addFields({ name: 'Result', value: `Sorry, you rolled a ${outcome} and lost ${amount} ${coinSymbol}. Better luck next time!` });
    }

    message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'diceroll',
    description: 'Roll a dice and bet on the outcome',
    options: [
      {
        name: 'guess',
        type: 10, // NUMBER
        description: 'The number to guess (1-6)',
        required: true,
        minValue: 1,
        maxValue: 6,
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
    const guess = interaction.options.getNumber('guess');
    const amount = interaction.options.getNumber('amount');

    const balance = await getBalance(interaction.guild.id, interaction.user.id);
    if (balance < amount) {
      return interaction.followUp({ content: 'Insufficient balance for the bet.', ephemeral: true });
    }

    const outcome = Math.floor(Math.random() * 6) + 1;

    const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('Dice Roll')
      .setDescription(`You guessed: ${guess}\nOutcome: ${outcome}`)
      .setColor(guess === outcome ? '#00ff00' : '#ff0000')
      .setTimestamp();

    if (guess === outcome) {
      const multiplier = 6;
      const winnings = amount * multiplier;
      await addBalance(interaction.guild.id, interaction.user.id, winnings);
      embed.addFields({ name: 'Result', value: `Congratulations! You rolled a ${outcome} and won ${winnings} ${coinSymbol}!` });
    } else {
      await removeBalance(interaction.guild.id, interaction.user.id, amount);
      embed.addFields({ name: 'Result', value: `Sorry, you rolled a ${outcome} and lost ${amount} ${coinSymbol}. Better luck next time!` });
    }

    await interaction.followUp({ embeds: [embed] });
  },
};
