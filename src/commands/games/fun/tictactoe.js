// src/commands/games/fun/tictactoe.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const EMPTY = '⬜';
const PLAYER_X = '❌';
const PLAYER_O = '⭕';

module.exports = {
  name: 'tictactoe',
  description: 'Play a game of Tic-Tac-Toe against another player',
  usage: '@opponent',
  aliases: ['ttt'],
  permissions: [],
  execute: async (message) => {
    const opponent = message.mentions.users.first();

    if (!opponent) {
      return message.channel.send('Please mention an opponent to play against.');
    }

    if (opponent.bot || opponent.id === message.author.id) {
      return message.channel.send('You cannot play against bots or yourself.');
    }

    const board = Array(9).fill(EMPTY);
    let currentPlayer = PLAYER_X;

    const embed = new EmbedBuilder()
      .setTitle('Tic-Tac-Toe')
      .setDescription(renderBoard(board))
      .addFields(
        { name: 'Player X', value: message.author.toString(), inline: true },
        { name: 'Player O', value: opponent.toString(), inline: true },
        { name: 'Current Turn', value: currentPlayer === PLAYER_X ? message.author.toString() : opponent.toString() }
      )
      .setColor('#FFFF00');

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('0').setLabel('-').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('1').setLabel('-').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('2').setLabel('-').setStyle(ButtonStyle.Secondary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('3').setLabel('-').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('4').setLabel('-').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('5').setLabel('-').setStyle(ButtonStyle.Secondary)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('6').setLabel('-').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('7').setLabel('-').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('8').setLabel('-').setStyle(ButtonStyle.Secondary)
      );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row1, row2, row3] });

    const collector = sentMessage.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === message.author.id || interaction.user.id === opponent.id,
      time: 60000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== (currentPlayer === PLAYER_X ? message.author.id : opponent.id)) {
        return interaction.channel.send('It is not your turn.').then((msg) => {
          setTimeout(() => msg.delete(), 3000);
        });
      }

      const index = parseInt(interaction.customId);

      if (board[index] !== EMPTY) {
        return interaction.channel.send('That cell is already occupied.').then((msg) => {
          setTimeout(() => msg.delete(), 3000);
        });
      }

      board[index] = currentPlayer;
      currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;

      const winner = getWinner(board);

      if (winner) {
        embed.setDescription(renderBoard(board))
          .spliceFields(2, 1, { name: 'Winner', value: winner === PLAYER_X ? message.author.toString() : opponent.toString() });
        await interaction.update({ embeds: [embed], components: [] });
        collector.stop();
        return;
      }

      if (!board.includes(EMPTY)) {
        embed.setDescription(renderBoard(board))
          .spliceFields(2, 1, { name: 'Result', value: 'It\'s a tie!' });
        await interaction.update({ embeds: [embed], components: [] });
        collector.stop();
        return;
      }

      embed.setDescription(renderBoard(board))
        .spliceFields(2, 1, { name: 'Current Turn', value: currentPlayer === PLAYER_X ? message.author.toString() : opponent.toString() });
      await interaction.update({ embeds: [embed] });
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        embed.setDescription(renderBoard(board))
          .spliceFields(2, 1, { name: 'Result', value: 'The game timed out.' });
        await sentMessage.edit({ embeds: [embed], components: [] });
      }
    });
  },
};

function renderBoard(board) {
  let boardString = '';
  for (let i = 0; i < board.length; i++) {
    boardString += board[i];
    if ((i + 1) % 3 === 0) {
      boardString += '\n';
    }
  }
  return boardString;
}

function getWinner(board) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] !== EMPTY && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}
