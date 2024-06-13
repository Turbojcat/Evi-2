// src/commands/games/fun/rockpaperscissors.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const CHOICES = ['🪨', '📜', '✂️'];

module.exports = {
  name: 'rockpaperscissors',
  description: 'Play a game of Rock-Paper-Scissors against the bot',
  usage: '',
  aliases: ['rps'],
  permissions: [],
  execute: async (message) => {
    const embed = new EmbedBuilder()
      .setTitle('Rock-Paper-Scissors')
      .setDescription('Choose your move:')
      .setColor('#FF0000');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('rock').setLabel('Rock').setStyle(ButtonStyle.Primary).setEmoji('🪨'),
        new ButtonBuilder().setCustomId('paper').setLabel('Paper').setStyle(ButtonStyle.Primary).setEmoji('📜'),
        new ButtonBuilder().setCustomId('scissors').setLabel('Scissors').setStyle(ButtonStyle.Primary).setEmoji('✂️')
      );

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = sentMessage.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === message.author.id,
      time: 30000,
      max: 1,
    });

    collector.on('collect', async (interaction) => {
      const playerChoice = interaction.customId;
      const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

      const result = getResult(playerChoice, botChoice);

      embed.setDescription(`You chose ${playerChoice}\nBot chose ${botChoice}\n\n${result}`);
      await interaction.update({ embeds: [embed], components: [] });
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        embed.setDescription('The game timed out. No choice was made.');
        await sentMessage.edit({ embeds: [embed], components: [] });
      }
    });
  },
  data: {
    name: 'rockpaperscissors',
    description: 'Play a game of Rock-Paper-Scissors against the bot',
  },
  executeSlash: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Rock-Paper-Scissors')
      .setDescription('Choose your move:')
      .setColor('#FF0000');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('rock').setLabel('Rock').setStyle(ButtonStyle.Primary).setEmoji('🪨'),
        new ButtonBuilder().setCustomId('paper').setLabel('Paper').setStyle(ButtonStyle.Primary).setEmoji('📜'),
        new ButtonBuilder().setCustomId('scissors').setLabel('Scissors').setStyle(ButtonStyle.Primary).setEmoji('✂️')
      );

    const sentMessage = await interaction.channel.send({ embeds: [embed], components: [row] });

    const collector = sentMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30000,
      max: 1,
    });

    collector.on('collect', async (i) => {
      const playerChoice = i.customId;
      const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

      const result = getResult(playerChoice, botChoice);

      embed.setDescription(`You chose ${playerChoice}\nBot chose ${botChoice}\n\n${result}`);
      await i.update({ embeds: [embed], components: [] });
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        embed.setDescription('The game timed out. No choice was made.');
        await sentMessage.edit({ embeds: [embed], components: [] });
      }
    });
  },
};

function getResult(playerChoice, botChoice) {
  if (playerChoice === botChoice) {
    return 'It\'s a tie!';
  } else if (
    (playerChoice === '🪨' && botChoice === '✂️') ||
    (playerChoice === '📜' && botChoice === '🪨') ||
    (playerChoice === '✂️' && botChoice === '📜')
  ) {
    return 'You win!';
  } else {
    return 'You lose!';
  }
}
