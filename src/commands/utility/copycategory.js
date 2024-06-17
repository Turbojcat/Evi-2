// src/commands/utils/copycategory.js
const { hasPremiumSubscription } = require('../../database/database');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'copycategory',
  description: 'Copy a category and its channels',
  usage: '<source-category-id> <target-category-name>',
  aliases: [],
  permissions: ['MANAGE_CHANNELS'],
  permissionLevel: ['admin'],
  premium: true,
  execute: async (message, args) => {
    console.log(`Checking premium subscription for user: ${message.author.id}`);
    const isPremiumUser = await hasPremiumSubscription(message.author.id);
    console.log(`isPremiumUser: ${isPremiumUser}`);

    if (!isPremiumUser) {
      return message.channel.send('This command is only available for premium users.');
    }

    const sourceCategoryID = args[0];
    const targetCategoryName = args.slice(1).join(' ');

    if (!sourceCategoryID || !targetCategoryName) {
      return message.channel.send('Please provide a source category ID and a target category name.');
    }

    const sourceCategory = message.guild.channels.cache.get(sourceCategoryID);

    if (!sourceCategory || sourceCategory.type !== 'GUILD_CATEGORY') {
      return message.channel.send('Invalid source category ID.');
    }

    try {
      const targetCategory = await message.guild.channels.create(targetCategoryName, {
        type: 'GUILD_CATEGORY',
        permissionOverwrites: sourceCategory.permissionOverwrites.cache.map(overwrite => ({
          id: overwrite.id,
          allow: new PermissionsBitField(overwrite.allow).bitfield,
          deny: new PermissionsBitField(overwrite.deny).bitfield,
        })),
      });

      for (const channel of sourceCategory.children.values()) {
        await message.guild.channels.create(channel.name, {
          type: channel.type,
          parent: targetCategory.id,
          topic: channel.topic,
          nsfw: channel.nsfw,
          bitrate: channel.bitrate,
          userLimit: channel.userLimit,
          rateLimitPerUser: channel.rateLimitPerUser,
          permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            allow: new PermissionsBitField(overwrite.allow).bitfield,
            deny: new PermissionsBitField(overwrite.deny).bitfield,
          })),
        });
      }

      message.channel.send(`Category "${sourceCategory.name}" and its channels have been copied to "${targetCategoryName}".`);
    } catch (error) {
      console.error('Error copying category:', error);
      message.channel.send('An error occurred while copying the category. Please try again later.');
    }
  },
  data: {
    name: 'copycategory',
    description: 'Copy a category and its channels',
    options: [
      {
        name: 'source-category-id',
        type: 3, // STRING
        description: 'The ID of the source category',
        required: true,
      },
      {
        name: 'target-category-name',
        type: 3, // STRING
        description: 'The name of the target category',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    console.log(`Checking premium subscription for user: ${interaction.user.id}`);
    const isPremiumUser = await hasPremiumSubscription(interaction.user.id);
    console.log(`isPremiumUser: ${isPremiumUser}`);

    if (!isPremiumUser) {
      return interaction.reply({ content: 'This command is only available for premium users.', ephemeral: true });
    }

    const sourceCategoryID = interaction.options.getString('source-category-id');
    const targetCategoryName = interaction.options.getString('target-category-name');

    const sourceCategory = interaction.guild.channels.cache.get(sourceCategoryID);

    if (!sourceCategory || sourceCategory.type !== 'GUILD_CATEGORY') {
      return interaction.reply({ content: 'Invalid source category ID.', ephemeral: true });
    }

    try {
      const targetCategory = await interaction.guild.channels.create(targetCategoryName, {
        type: 'GUILD_CATEGORY',
        permissionOverwrites: sourceCategory.permissionOverwrites.cache.map(overwrite => ({
          id: overwrite.id,
          allow: new PermissionsBitField(overwrite.allow).bitfield,
          deny: new PermissionsBitField(overwrite.deny).bitfield,
        })),
      });

      for (const channel of sourceCategory.children.values()) {
        await interaction.guild.channels.create(channel.name, {
          type: channel.type,
          parent: targetCategory.id,
          topic: channel.topic,
          nsfw: channel.nsfw,
          bitrate: channel.bitrate,
          userLimit: channel.userLimit,
          rateLimitPerUser: channel.rateLimitPerUser,
          permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            allow: new PermissionsBitField(overwrite.allow).bitfield,
            deny: new PermissionsBitField(overwrite.deny).bitfield,
          })),
        });
      }

      interaction.reply(`Category "${sourceCategory.name}" and its channels have been copied to "${targetCategoryName}".`);
    } catch (error) {
      console.error('Error copying category:', error);
      interaction.reply({ content: 'An error occurred while copying the category. Please try again later.', ephemeral: true });
    }
  },
};
