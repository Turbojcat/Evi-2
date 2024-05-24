// src/commands/developer/evistory.js
const { EmbedBuilder } = require('discord.js');
const { getStoryChannel } = require('../../database/database');

module.exports = {
  name: 'evistory',
  description: 'Posts a story in the designated story channel (developer only)',
  usage: '<story>',
  permissions: [],
  execute: async (message, args) => {
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    const storyChannel = await getStoryChannel(message.guild.id);
    if (!storyChannel) {
      return message.reply('No story channel has been set. Please use the `evistorychannel` command to set a channel.');
    }

    const story = args.join(' ');
    if (!story) {
      return message.reply('Please provide a story to post.');
    }

    const channel = message.guild.channels.cache.get(storyChannel);
    if (!channel) {
      return message.reply('The designated story channel could not be found.');
    }

    await channel.send(story);
    message.reply('Story posted successfully!');
  },
  data: {
    name: 'evistory',
    description: 'Posts a story in the designated story channel (developer only)',
    options: [
      {
        name: 'story',
        type: 3, // STRING
        description: 'The story to post',
        required: true,
      },
      {
        name: 'embed',
        type: 1, // SUB_COMMAND
        description: 'Posts the story as an embed',
        options: [
          {
            name: 'embed_data',
            type: 3, // STRING
            description: 'The embed data in JSON format (generated from https://embed.dan.onl/)',
            required: true,
          },
        ],
      },
    ],
  },
  executeSlash: async (interaction) => {
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({ content: 'This command is only available for developers.', ephemeral: true });
    }

    const storyChannel = await getStoryChannel(interaction.guild.id);
    if (!storyChannel) {
      return interaction.reply({ content: 'No story channel has been set. Please use the `evistorychannel` command to set a channel.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'embed') {
      const embedData = interaction.options.getString('embed_data');

      try {
        const embed = JSON.parse(embedData);
        const channel = interaction.guild.channels.cache.get(storyChannel);
        if (!channel) {
          return interaction.reply({ content: 'The designated story channel could not be found.', ephemeral: true });
        }

        await channel.send({ embeds: [embed] });
        interaction.reply({ content: 'Story posted successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error parsing embed data:', error);
        interaction.reply({ content: 'Invalid embed data. Please provide valid JSON data generated from https://embed.dan.onl/.', ephemeral: true });
      }
    } else {
      const story = interaction.options.getString('story');
      if (!story) {
        return interaction.reply({ content: 'Please provide a story to post.', ephemeral: true });
      }

      const channel = interaction.guild.channels.cache.get(storyChannel);
      if (!channel) {
        return interaction.reply({ content: 'The designated story channel could not be found.', ephemeral: true });
      }

      await channel.send(story);
      interaction.reply({ content: 'Story posted successfully!', ephemeral: true });
    }
  },
};
