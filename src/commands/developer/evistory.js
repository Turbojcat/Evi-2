// src/commands/developer/evistory.js
const { EmbedBuilder } = require('discord.js');
const { getStoryChannels } = require('../../database/database');

module.exports = {
  name: 'evistory',
  description: 'Posts a story in the designated story channels across all servers (developer only)',
  usage: '<story>',
  aliases: ['es'],
  permissions: [],
  execute: async (message, args) => {
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    if (!developerIDs.includes(message.author.id)) {
      return message.reply('This command is only available for developers.');
    }

    try {
      const storyChannels = await getStoryChannels();
      if (storyChannels.length === 0) {
        return message.reply('No story channels have been set on any server.');
      }

      const story = args.join(' ');
      if (!story) {
        return message.reply('Please provide a story to post.');
      }

      for (const storyChannel of storyChannels) {
        const guild = message.client.guilds.cache.get(storyChannel.guild_id);
        if (guild) {
          const channel = guild.channels.cache.get(storyChannel.setting_value);
          if (channel) {
            await channel.send(story);
          }
        }
      }

      message.reply('Story posted successfully across all servers!');
    } catch (error) {
      console.error('Error posting story:', error);
      message.reply('An error occurred while posting the story.');
    }
  },
  data: {
    name: 'evistory',
    description: 'Posts a story in the designated story channels across all servers (developer only)',
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

    try {
      const storyChannels = await getStoryChannels();
      if (storyChannels.length === 0) {
        return interaction.reply({ content: 'No story channels have been set on any server.', ephemeral: true });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'embed') {
        const embedData = interaction.options.getString('embed_data');

        try {
          const embed = JSON.parse(embedData);

          for (const storyChannel of storyChannels) {
            const guild = interaction.client.guilds.cache.get(storyChannel.guild_id);
            if (guild) {
              const channel = guild.channels.cache.get(storyChannel.setting_value);
              if (channel) {
                await channel.send({ embeds: [embed] });
              }
            }
          }

          interaction.reply({ content: 'Story posted successfully across all servers!', ephemeral: true });
        } catch (error) {
          console.error('Error parsing embed data:', error);
          interaction.reply({ content: 'Invalid embed data. Please provide valid JSON data generated from https://embed.dan.onl/.', ephemeral: true });
        }
      } else {
        const story = interaction.options.getString('story');
        if (!story) {
          return interaction.reply({ content: 'Please provide a story to post.', ephemeral: true });
        }

        for (const storyChannel of storyChannels) {
          const guild = interaction.client.guilds.cache.get(storyChannel.guild_id);
          if (guild) {
            const channel = guild.channels.cache.get(storyChannel.setting_value);
            if (channel) {
              await channel.send(story);
            }
          }
        }

        interaction.reply({ content: 'Story posted successfully across all servers!', ephemeral: true });
      }
    } catch (error) {
      console.error('Error posting story:', error);
      interaction.reply({ content: 'An error occurred while posting the story.', ephemeral: true });
    }
  },
};
