// src/commands/games/fun/slots.js
const { getBalance, addBalance, removeBalance, getEcoSetting } = require('../../../database/ecodb');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'slots',
  description: 'Play the slot machine',
  usage: '<amount>',
  aliases: [],
  permissions: [],
  execute: async (message, args) => {
    const amount = parseInt(args[0]);

    if (!amount || amount < 5) {
      return message.channel.send('Please provide a bet amount greater than or equal to 5.');
    }

    const balance = await getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.channel.send('Insufficient balance for the bet.');
    }

    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💰'];
    const slots = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const slotOutput = `| ${slots[0]} | ${slots[1]} | ${slots[2]} |`;

    const coinSymbol = await getEcoSetting(message.guild.id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('Slot Machine')
      .setDescription(slotOutput)
      .setColor(slots[0] === slots[1] && slots[1] === slots[2] ? '#00ff00' : '#ff0000')
      .setTimestamp();

    if (slots[0] === slots[1] && slots[1] === slots[2]) {
      const multiplier = symbols.indexOf(slots[0]) + 1;
      const winnings = amount * multiplier;
      await addBalance(message.guild.id, message.author.id, winnings);
      embed.addFields({ name: 'Result', value: `Congratulations! You hit the jackpot and won ${winnings} ${coinSymbol}!` });
    } else {
      await removeBalance(message.guild.id, message.author.id, amount);
      embed.addFields({ name: 'Result', value: `Sorry, you didn't win. You lost ${amount} ${coinSymbol}. Better luck next time!` });
    }

    message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'slots',
    description: 'Play the slot machine',
    options: [
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
    const amount = interaction.options.getNumber('amount');

    const balance = await getBalance(interaction.guild.id, interaction.user.id);
    if (balance < amount) {
      return interaction.followUp({ content: 'Insufficient balance for the bet.', ephemeral: true });
    }

    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💰'];
    const slots = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const slotOutput = `| ${slots[0]} | ${slots[1]} | ${slots[2]} |`;

    const coinSymbol = await getEcoSetting(interaction.guild.id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('Slot Machine')
      .setDescription(slotOutput)
      .setColor(slots[0] === slots[1] && slots[1] === slots[2] ? '#00ff00' : '#ff0000')
      .setTimestamp();

    if (slots[0] === slots[1] && slots[1] === slots[2]) {
      const multiplier = symbols.indexOf(slots[0]) + 1;
      const winnings = amount * multiplier;
      await addBalance(interaction.guild.id, interaction.user.id, winnings);
      embed.addFields({ name: 'Result', value: `Congratulations! You hit the jackpot and won ${winnings} ${coinSymbol}!` });
    } else {
      await removeBalance(interaction.guild.id, interaction.user.id, amount);
      embed.addFields({ name: 'Result', value: `Sorry, you didn't win. You lost ${amount} ${coinSymbol}. Better luck next time!` });
    }

    await interaction.followUp({ embeds: [embed] });
  },
};
