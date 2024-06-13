// src/commands/games/fun/lottery.js
const { getBalance, addBalance, removeBalance, getEcoSetting } = require('../../../database/ecodb');
const { EmbedBuilder } = require('discord.js');

const participants = new Map();
let prizePool = 0;
let lotteryInterval;
let lotteryStartTime;
const lotteryAmount = 100;

module.exports = {
  name: 'lottery',
  description: 'Participate in the lottery for a chance to win the prize pool',
  usage: 'lottery [info|bet <amount>]',
  aliases: ['lotto'],
  permissions: [],
  execute: async (message, args) => {
    const subcommand = args[0];

    if (subcommand === 'info') {
      const embed = new EmbedBuilder()
        .setTitle('🎲 Lottery Information 🎲')
        .setDescription(`Here's how the lottery works:\n\n1. Use the \`!lottery bet <amount>\` command to participate in the lottery. The minimum bet amount is ${lotteryAmount}.\n\n2. Each ticket costs the specified bet amount and consists of 6 randomly generated numbers between 1 and 50.\n\n3. The lottery starts when the first participant joins. The draw will take place 48 hours after the first participant joins.\n\n4. If there are 5 or more participants before 24 hours have passed since the first participant joined, the timer will be set to 24 hours. If more than 24 hours have passed, the timer will not change.\n\n5. During the draw, 6 winning numbers are randomly selected. If your ticket numbers match all 6 winning numbers, you win a share of the prize pool!\n\n6. If there are multiple winners, the prize pool is split equally among them. If there are no winners, the prize pool rolls over to the next draw.\n\n7. The prize pool consists of the total bet amounts from all participants.\n\n8. To check the current prize pool and number of participants, use the \`!lottery info\` command.\n\nGood luck and have fun! 🍀`)
        .setColor('#FFD700')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    if (subcommand === 'bet') {
      const betAmount = parseInt(args[1]);

      if (!betAmount || betAmount < lotteryAmount) {
        return message.channel.send(`Please provide a valid bet amount greater than or equal to ${lotteryAmount}.`);
      }

      const balance = await getBalance(message.guild.id, message.author.id);
      if (balance < betAmount) {
        return message.channel.send(`Insufficient balance to participate in the lottery. Your current balance is ${balance}.`);
      }

      await removeBalance(message.guild.id, message.author.id, betAmount);
      prizePool += betAmount;

      const ticketNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 1);
      participants.set(message.author.id, ticketNumbers);

      message.channel.send(`You have successfully purchased a lottery ticket with the numbers: ${ticketNumbers.join(', ')}. Good luck! 🍀`);

      if (!lotteryInterval) {
        lotteryStartTime = Date.now();
        lotteryInterval = setTimeout(() => {
          startLottery(message.client);
        }, 48 * 60 * 60 * 1000); // 48 hours in milliseconds
      } else {
        const elapsedTime = Date.now() - lotteryStartTime;
        if (elapsedTime < 24 * 60 * 60 * 1000 && participants.size >= 5) {
          clearTimeout(lotteryInterval);
          lotteryInterval = setTimeout(() => {
            startLottery(message.client);
          }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
        }
      }
    } else {
      message.channel.send(`Invalid subcommand. Please use \`!lottery info\` or \`!lottery bet <amount>\`.`);
    }
  },
  data: {
    name: 'lottery',
    description: 'Participate in the lottery for a chance to win the prize pool',
    options: [
      {
        name: 'info',
        type: 1, // SUB_COMMAND
        description: 'Get information about how the lottery works',
      },
      {
        name: 'bet',
        type: 1, // SUB_COMMAND
        description: 'Place a bet and participate in the lottery',
        options: [
          {
            name: 'amount',
            type: 10, // NUMBER
            description: 'The amount to bet (minimum 100)',
            required: true,
            minValue: 100,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'info') {
      const embed = new EmbedBuilder()
        .setTitle('🎲 Lottery Information 🎲')
        .setDescription(`Here's how the lottery works:\n\n1. Use the \`/lottery bet <amount>\` command to participate in the lottery. The minimum bet amount is ${lotteryAmount}.\n\n2. Each ticket costs the specified bet amount and consists of 6 randomly generated numbers between 1 and 50.\n\n3. The lottery starts when the first participant joins. The draw will take place 48 hours after the first participant joins.\n\n4. If there are 5 or more participants before 24 hours have passed since the first participant joined, the timer will be set to 24 hours. If more than 24 hours have passed, the timer will not change.\n\n5. During the draw, 6 winning numbers are randomly selected. If your ticket numbers match all 6 winning numbers, you win a share of the prize pool!\n\n6. If there are multiple winners, the prize pool is split equally among them. If there are no winners, the prize pool rolls over to the next draw.\n\n7. The prize pool consists of the total bet amounts from all participants.\n\n8. To check the current prize pool and number of participants, use the \`/lottery info\` command.\n\nGood luck and have fun! 🍀`)
        .setColor('#FFD700')
        .setTimestamp();

      return interaction.channel.send({ embeds: [embed] });
    }

    if (subcommand === 'bet') {
      const betAmount = interaction.options.getNumber('amount');

      const balance = await getBalance(interaction.guild.id, interaction.user.id);
      if (balance < betAmount) {
        return interaction.channel.send(`Insufficient balance to participate in the lottery. Your current balance is ${balance}.`);
      }

      await removeBalance(interaction.guild.id, interaction.user.id, betAmount);
      prizePool += betAmount;

      const ticketNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 1);
      participants.set(interaction.user.id, ticketNumbers);

      interaction.channel.send(`You have successfully purchased a lottery ticket with the numbers: ${ticketNumbers.join(', ')}. Good luck! 🍀`);

      if (!lotteryInterval) {
        lotteryStartTime = Date.now();
        lotteryInterval = setTimeout(() => {
          startLottery(interaction.client);
        }, 48 * 60 * 60 * 1000); // 48 hours in milliseconds
      } else {
        const elapsedTime = Date.now() - lotteryStartTime;
        if (elapsedTime < 24 * 60 * 60 * 1000 && participants.size >= 5) {
          clearTimeout(lotteryInterval);
          lotteryInterval = setTimeout(() => {
            startLottery(interaction.client);
          }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
        }
      }
    }
  },
};

function startLottery(client) {
  const winningNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 1);
  const winners = [];

  for (const [userId, ticketNumbers] of participants.entries()) {
    if (ticketNumbers.every(number => winningNumbers.includes(number))) {
      winners.push(userId);
    }
  }

  if (winners.length > 0) {
    const winnerIds = [...new Set(winners)];
    const winningAmount = Math.floor(prizePool / winnerIds.length);

    for (const winnerId of winnerIds) {
      addBalance(client.guilds.cache.first().id, winnerId, winningAmount);
    }

    const winnerMentions = winnerIds.map(winnerId => `<@${winnerId}>`).join(', ');
    const coinSymbol = getEcoSetting(client.guilds.cache.first().id, 'coinSymbol', '💰');

    const embed = new EmbedBuilder()
      .setTitle('🎉 Lottery Results 🎉')
      .setDescription(`Congratulations to the winners of the lottery!\n\n🥳 Winners: ${winnerMentions}\n\n🎲 Winning Numbers: ${winningNumbers.join(', ')}\n\n💰 Prize Pool: ${prizePool} ${coinSymbol}\n\n🏆 Each winner receives: ${winningAmount} ${coinSymbol}`)
      .setColor('#FFD700')
      .setTimestamp();

    client.guilds.cache.first().channels.cache.find(channel => channel.name === 'lottery').send({ content: `${winnerMentions}`, embeds: [embed] });

    prizePool = 0;
  } else {
    const embed = new EmbedBuilder()
      .setTitle('🎉 Lottery Results 🎉')
      .setDescription(`No winners in this lottery draw. The prize pool of ${prizePool} ${getEcoSetting(client.guilds.cache.first().id, 'coinSymbol', '💰')} will be carried over to the next draw.`)
      .setColor('#FFD700')
      .setTimestamp();

    client.guilds.cache.first().channels.cache.find(channel => channel.name === 'lottery').send({ embeds: [embed] });
  }

  participants.clear();
  lotteryInterval = null;
}
