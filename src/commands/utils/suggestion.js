// src/commands/utils/suggestion.js
const { EmbedBuilder } = require('discord.js');
const { suggestionChannelId } = require('../../config');
const { isSuggestionBlacklisted } = require('../../database/database');

module.exports = {
  name: 'suggestion',
  description: 'Submit a suggestion for function to Evi!s',
  usage: '<suggestion>',
  aliases: ['suggest'],
  permissions: [],
  execute: async (message, args) => {
    const suggestion = args.join(' ');

    if (!suggestion) {
      return message.channel.send('Please provide a suggestion.');
    }

    const isBlacklisted = await isSuggestionBlacklisted(message.author.id);

    if (isBlacklisted) {
      return message.channel.send('You are blacklisted from submitting suggestions.');
    }

    const suggestionChannel = message.guild.channels.cache.get(suggestionChannelId);

    if (!suggestionChannel) {
      return message.channel.send('Suggestion channel not found. Please contact an administrator.');
    }

    const embed = new EmbedBuilder()
      .setTitle('New Suggestion')
      .setDescription(suggestion)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp();

    try {
      const sentMessage = await suggestionChannel.send({ embeds: [embed] });
      await sentMessage.react('👍');
      await sentMessage.react('👎');
      message.channel.send('Your suggestion has been submitted. Thank you!');
    } catch (error) {
      console.error('Error sending suggestion:', error);
      message.channel.send('An error occurred while submitting your suggestion. Please try again later.');
    }
  },
  data: {
    name: 'suggestion',
    description: 'Submit a suggestion',
    options: [
      {
        name: 'suggestion',
        type: 3, // STRING
        description: 'The suggestion text',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const suggestion = interaction.options.getString('suggestion');
    const isBlacklisted = await isSuggestionBlacklisted(interaction.user.id);

    if (isBlacklisted) {
      return interaction.reply({ content: 'You are blacklisted from submitting suggestions.', ephemeral: true });
    }

    const suggestionChannel = interaction.guild.channels.cache.get(suggestionChannelId);

    if (!suggestionChannel) {
      return interaction.reply({ content: 'Suggestion channel not found. Please contact an administrator.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('New Suggestion')
      .setDescription(suggestion)
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
      .setTimestamp();

    try {
      const sentMessage = await suggestionChannel.send({ embeds: [embed] });
      await sentMessage.react('👍');
      await sentMessage.react('👎');
      interaction.reply({ content: 'Your suggestion has been submitted. Thank you!', ephemeral: true });
    } catch (error) {
      console.error('Error sending suggestion:', error);
      interaction.reply({ content: 'An error occurred while submitting your suggestion. Please try again later.', ephemeral: true });
    }
  },
};
