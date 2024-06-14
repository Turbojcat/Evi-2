// src/commands/utility/customEmbed.js
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { createEmbed, getEmbed, getEmbeds, updateEmbed, deleteEmbed } = require('../../database/embeddb');

module.exports = {
  name: 'customembed',
  description: 'Manages custom embeds',
  usage: '<create|edit|delete|list> [options]',
  aliases: ['ce'],
  permissions: [],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];

    if (subcommand === 'create') {
      await module.exports.executeCreate(message, args.slice(1));
    } else if (subcommand === 'edit') {
      await module.exports.executeEdit(message, args.slice(1));
    } else if (subcommand === 'delete') {
      await module.exports.executeDelete(message, args.slice(1));
    } else if (subcommand === 'list') {
      await module.exports.executeList(message);
    } else {
      message.reply('Invalid subcommand. Please use "create", "edit", "delete", or "list".');
    }
  },
  executeCreate: async (message, args) => {
    const title = args[0];
    const description = args.slice(1).join(' ');

    if (!title || !description) {
      return message.reply('Please provide a title and description for the custom embed.');
    }

    try {
      const embedId = await createEmbed(message.author.id, message.guild.id, { title, description });
      message.reply(`Custom embed created with ID: ${embedId}`);
    } catch (error) {
      console.error('Error creating custom embed:', error);
      message.reply('An error occurred while creating the custom embed.');
    }
  },
  executeEdit: async (message, args) => {
    const embedId = parseInt(args[0]);
    const title = args[1];
    const description = args.slice(2).join(' ');

    if (!embedId || !title || !description) {
      return message.reply('Please provide the embed ID, title, and description to edit the custom embed.');
    }

    try {
      const embedData = await getEmbed(message.author.id, message.guild.id, embedId);

      if (!embedData) {
        return message.reply('Custom embed not found.');
      }

      const updatedEmbedData = {
        title,
        description,
      };

      await updateEmbed(message.author.id, message.guild.id, embedId, updatedEmbedData);
      message.reply(`Custom embed with ID ${embedId} updated.`);
    } catch (error) {
      console.error('Error updating custom embed:', error);
      message.reply('An error occurred while updating the custom embed.');
    }
  },
  executeDelete: async (message, args) => {
    const embedId = parseInt(args[0]);

    if (!embedId) {
      return message.reply('Please provide the embed ID to delete the custom embed.');
    }

    try {
      const success = await deleteEmbed(message.author.id, message.guild.id, embedId);

      if (success) {
        message.reply(`Custom embed with ID ${embedId} deleted.`);
      } else {
        message.reply('Custom embed not found.');
      }
    } catch (error) {
      console.error('Error deleting custom embed:', error);
      message.reply('An error occurred while deleting the custom embed.');
    }
  },
  executeList: async (message) => {
    try {
      const embeds = await getEmbeds(message.author.id, message.guild.id);

      if (embeds.length === 0) {
        return message.reply('No custom embeds found.');
      }

      const embedList = embeds.map((embed) => `ID: ${embed.id}, Title: ${embed.data.title}`).join('\n');
      const embed = new EmbedBuilder()
        .setTitle('Custom Embeds')
        .setDescription(embedList)
        .setColor('#0099ff')
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error retrieving custom embeds:', error);
      message.reply('An error occurred while retrieving the custom embeds.');
    }
  },
  data: new SlashCommandBuilder()
    .setName('customembed')
    .setDescription('Manages custom embeds')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Creates a new custom embed')
        .addStringOption((option) => option.setName('title').setDescription('The title of the embed').setRequired(true))
        .addStringOption((option) => option.setName('description').setDescription('The description of the embed').setRequired(true))
        .addStringOption((option) => option.setName('color').setDescription('The color of the embed').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edits an existing custom embed')
        .addIntegerOption((option) => option.setName('id').setDescription('The ID of the embed to edit').setRequired(true))
        .addStringOption((option) => option.setName('title').setDescription('The new title of the embed').setRequired(false))
        .addStringOption((option) => option.setName('description').setDescription('The new description of the embed').setRequired(false))
        .addStringOption((option) => option.setName('color').setDescription('The new color of the embed').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Deletes a custom embed')
        .addIntegerOption((option) => option.setName('id').setDescription('The ID of the embed to delete').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Lists all custom embeds')
    ),
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (subcommand === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color');

      const embedData = {
        title,
        description,
        color: color ? parseInt(color, 16) : null,
      };

      try {
        const embedId = await createEmbed(userId, guildId, embedData);
        await interaction.reply(`Custom embed created with ID: ${embedId}`);
      } catch (error) {
        console.error('Error creating custom embed:', error);
        await interaction.reply('An error occurred while creating the custom embed.');
      }
    } else if (subcommand === 'edit') {
      const embedId = interaction.options.getInteger('id');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color');

      try {
        const embedData = await getEmbed(userId, guildId, embedId);

        if (!embedData) {
          return await interaction.reply('Custom embed not found.');
        }

        const updatedEmbedData = {
          title: title || embedData.title,
          description: description || embedData.description,
          color: color ? parseInt(color, 16) : embedData.color,
        };

        await updateEmbed(userId, guildId, embedId, updatedEmbedData);
        await interaction.reply(`Custom embed with ID ${embedId} updated.`);
      } catch (error) {
        console.error('Error updating custom embed:', error);
        await interaction.reply('An error occurred while updating the custom embed.');
      }
    } else if (subcommand === 'delete') {
      const embedId = interaction.options.getInteger('id');

      try {
        const success = await deleteEmbed(userId, guildId, embedId);

        if (success) {
          await interaction.reply(`Custom embed with ID ${embedId} deleted.`);
        } else {
          await interaction.reply('Custom embed not found.');
        }
      } catch (error) {
        console.error('Error deleting custom embed:', error);
        await interaction.reply('An error occurred while deleting the custom embed.');
      }
    } else if (subcommand === 'list') {
      try {
        const embeds = await getEmbeds(userId, guildId);

        if (embeds.length === 0) {
          return await interaction.reply('No custom embeds found.');
        }

        const embedList = embeds.map((embed) => `ID: ${embed.id}, Title: ${embed.data.title}`).join('\n');
        const embed = new EmbedBuilder()
          .setTitle('Custom Embeds')
          .setDescription(embedList)
          .setColor('#0099ff')
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error retrieving custom embeds:', error);
        await interaction.reply('An error occurred while retrieving the custom embeds.');
      }
    }
  },
};
