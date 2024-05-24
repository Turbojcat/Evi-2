// src/commands/utils/copycategory.js
const { PermissionsBitField } = require('discord.js');
const { hasPremiumSubscription } = require('../../database/database');

module.exports = {
  name: 'copycategory',
  description: 'Copies a category with all its permissions (premium only)',
  usage: '<source-category> <destination-category>',
  aliases: ['copycat', 'cc'],
  permissions: ['MANAGE_CHANNELS'],
  premium: true,
  execute: async (message, args) => {
    const isPremium = await hasPremiumSubscription(message.author.id);
    if (!isPremium) {
      return message.reply('This command is only available for premium users.');
    }

    const sourceCategoryName = args[0];
    const destinationCategoryName = args[1];

    if (!sourceCategoryName || !destinationCategoryName) {
      return message.reply('Please provide the source and destination category names.');
    }

    const sourceCategory = message.guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_CATEGORY' && channel.name === sourceCategoryName
    );

    if (!sourceCategory) {
      return message.reply(`Category "${sourceCategoryName}" not found.`);
    }

    const destinationCategory = message.guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_CATEGORY' && channel.name === destinationCategoryName
    );

    if (destinationCategory) {
      return message.reply(`Category "${destinationCategoryName}" already exists.`);
    }

    const newCategory = await message.guild.channels.create(destinationCategoryName, {
      type: 'GUILD_CATEGORY',
      permissionOverwrites: sourceCategory.permissionOverwrites.cache.map((overwrite) => ({
        id: overwrite.id,
        allow: new PermissionsBitField(overwrite.allow),
        deny: new PermissionsBitField(overwrite.deny),
      })),
    });

    message.reply(`Category "${destinationCategoryName}" created with permissions copied from "${sourceCategoryName}".`);
  },
  data: {
    name: 'copycategory',
    description: 'Copies a category with all its permissions (premium only)',
    options: [
      {
        name: 'source-category',
        type: 3, // STRING
        description: 'The name of the source category',
        required: true,
      },
      {
        name: 'destination-category',
        type: 3, // STRING
        description: 'The name of the destination category',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const isPremium = await hasPremiumSubscription(interaction.user.id);
    if (!isPremium) {
      return interaction.reply({ content: 'This command is only available for premium users.', ephemeral: true });
    }

    const sourceCategoryName = interaction.options.getString('source-category');
    const destinationCategoryName = interaction.options.getString('destination-category');

    const sourceCategory = interaction.guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_CATEGORY' && channel.name === sourceCategoryName
    );

    if (!sourceCategory) {
      return interaction.reply({ content: `Category "${sourceCategoryName}" not found.`, ephemeral: true });
    }

    const destinationCategory = interaction.guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_CATEGORY' && channel.name === destinationCategoryName
    );

    if (destinationCategory) {
      return interaction.reply({ content: `Category "${destinationCategoryName}" already exists.`, ephemeral: true });
    }

    const newCategory = await interaction.guild.channels.create(destinationCategoryName, {
      type: 'GUILD_CATEGORY',
      permissionOverwrites: sourceCategory.permissionOverwrites.cache.map((overwrite) => ({
        id: overwrite.id,
        allow: new PermissionsBitField(overwrite.allow),
        deny: new PermissionsBitField(overwrite.deny),
      })),
    });

    interaction.reply(`Category "${destinationCategoryName}" created with permissions copied from "${sourceCategoryName}".`);
  },
};
