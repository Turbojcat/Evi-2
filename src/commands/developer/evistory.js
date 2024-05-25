// src/commands/developer/evistory.js
const { developerIDs } = require('../../config');
const { getStoryChannels } = require('../../database/database');

module.exports = {
  name: 'evistory',
  description: 'Posts a story in the designated story channels across all servers (developer only)',
  usage: '<story>',
  aliases: ['story'],
  permissions: [],
  execute: async (message, args) => {
    // ...
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
    ],
  },
  executeSlash: async (interaction) => {
    if (!developerIDs.includes(interaction.user.id)) {
      return interaction.reply({ content: 'This command is only available for developers.', ephemeral: true });
    }

    const story = interaction.options.getString('story');
    const storyChannels = await getStoryChannels();

    for (const { guild_id, setting_value } of storyChannels) {
      const guild = interaction.client.guilds.cache.get(guild_id);
      if (guild) {
        const channel = guild.channels.cache.get(setting_value);
        if (channel) {
          await channel.send(story);
        }
      }
    }

    interaction.reply('Story posted successfully!');
  },
};