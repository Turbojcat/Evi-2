// src/commands/utility/placeholders.js
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { placeholders } = require('../../placeholders');

module.exports = {
  name: 'placeholders',
  description: 'Displays the available placeholders for custom embeds',
  usage: '',
  permissions: [],
  execute: (message) => {
    const placeholderList = Object.entries(placeholders)
      .map(([placeholder, description]) => `{${placeholder}} - ${description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Available Placeholders')
      .setDescription('Here are the available placeholders you can use in your custom embeds:')
      .addFields({ name: 'Placeholders', value: placeholderList });

    message.channel.send({ embeds: [embed] });
  },
  data: new SlashCommandBuilder()
    .setName('placeholders')
    .setDescription('Displays the available placeholders for custom embeds'),
  executeSlash: (interaction) => {
    const placeholderList = Object.entries(placeholders)
      .map(([placeholder, description]) => `{${placeholder}} - ${description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Available Placeholders')
      .setDescription('Here are the available placeholders you can use in your custom embeds:')
      .addFields({ name: 'Placeholders', value: placeholderList });

    interaction.reply({ embeds: [embed] });
  },
};
