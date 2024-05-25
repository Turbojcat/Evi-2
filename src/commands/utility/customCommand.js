// src/commands/utility/customCommand.js
const { EmbedBuilder } = require('discord.js');
const { addCustomCommand, removeCustomCommand, executeCustomCommand, getCustomCommandCount, getCustomCommandLimit, getCustomCommands } = require('../../database/database');

module.exports = {
  name: 'customcommand',
  description: 'Manages custom commands',
  usage: '<add|remove|execute|list> <command> [response]',
  aliases: ['cc'],
  permissions: [],
  permissionLevel: ['admin'],
  executeAdd: async (message, args) => {
    const customCommand = args[0];
    const response = args.slice(1).join(' ');

    if (!customCommand || !response) {
      return message.reply('Please provide a custom command and response.');
    }

    const customCommandCount = await getCustomCommandCount(message.guild.id);
    const customCommandLimit = await getCustomCommandLimit(message.guild.id);

    if (customCommandCount >= customCommandLimit) {
      return message.reply(`You have reached the maximum number of custom commands (${customCommandLimit}). Please remove some before adding new ones.`);
    }

    try {
      await addCustomCommand(message.guild.id, customCommand, response);
      message.reply(`Custom command "${customCommand}" added with response: "${response}".`);
    } catch (error) {
      console.error('Error adding custom command:', error);
      message.reply('An error occurred while adding the custom command. Please try again later.');
    }
  },
  executeRemove: async (message, args) => {
    const customCommand = args[0];

    if (!customCommand) {
      return message.reply('Please provide a custom command to remove.');
    }

    try {
      await removeCustomCommand(message.guild.id, customCommand);
      message.reply(`Custom command "${customCommand}" removed.`);
    } catch (error) {
      console.error('Error removing custom command:', error);
      message.reply('An error occurred while removing the custom command. Please try again later.');
    }
  },
  executeExecute: async (message, args) => {
    const customCommand = args[0];

    if (!customCommand) {
      return message.reply('Please provide a custom command to execute.');
    }

    try {
      const response = await executeCustomCommand(message.guild.id, customCommand);
      if (response) {
        message.channel.send(response);
      } else {
        message.reply(`Custom command "${customCommand}" not found.`);
      }
    } catch (error) {
      console.error('Error executing custom command:', error);
      message.reply('An error occurred while executing the custom command. Please try again later.');
    }
  },
  executeList: async (message) => {
    const customCommands = await getCustomCommands(message.guild.id);

    if (customCommands.length === 0) {
      return message.reply('There are no custom commands for this server.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Custom Commands')
      .setDescription('Here is a list of all custom commands for this server:')
      .setColor('#0099ff')
      .setTimestamp();

    customCommands.forEach((command) => {
      embed.addFields({ name: command.command, value: command.response });
    });

    message.reply({ embeds: [embed] });
  },
  data: {
    name: 'customcommand',
    description: 'Manages custom commands',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds a new custom command',
        options: [
          {
            name: 'command',
            type: 3, // STRING
            description: 'The custom command trigger',
            required: true,
          },
          {
            name: 'response',
            type: 3, // STRING
            description: 'The response for the custom command',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes a custom command',
        options: [
          {
            name: 'command',
            type: 3, // STRING
            description: 'The custom command to remove',
            required: true,
          },
        ],
      },
      {
        name: 'execute',
        type: 1, // SUB_COMMAND
        description: 'Executes a custom command',
        options: [
          {
            name: 'command',
            type: 3, // STRING
            description: 'The custom command to execute',
            required: true,
          },
        ],
      },
      {
        name: 'list',
        type: 1, // SUB_COMMAND
        description: 'Lists all custom commands for the server',
      },
    ],
  },
  executeSlashAdd: async (interaction) => {
    const customCommand = interaction.options.getString('command');
    const response = interaction.options.getString('response');

    const customCommandCount = await getCustomCommandCount(interaction.guild.id);
    const customCommandLimit = await getCustomCommandLimit(interaction.guild.id);

    if (customCommandCount >= customCommandLimit) {
      return interaction.reply({ content: `You have reached the maximum number of custom commands (${customCommandLimit}). Please remove some before adding new ones.`, ephemeral: true });
    }

    try {
      await addCustomCommand(interaction.guild.id, customCommand, response);
      interaction.reply(`Custom command "${customCommand}" added with response: "${response}".`);
    } catch (error) {
      console.error('Error adding custom command:', error);
      interaction.reply({ content: 'An error occurred while adding the custom command. Please try again later.', ephemeral: true });
    }
  },
  executeSlashRemove: async (interaction) => {
    const customCommand = interaction.options.getString('command');

    try {
      await removeCustomCommand(interaction.guild.id, customCommand);
      interaction.reply(`Custom command "${customCommand}" removed.`);
    } catch (error) {
      console.error('Error removing custom command:', error);
      interaction.reply({ content: 'An error occurred while removing the custom command. Please try again later.', ephemeral: true });
    }
  },
  executeSlashExecute: async (interaction) => {
    const customCommand = interaction.options.getString('command');

    try {
      const response = await executeCustomCommand(interaction.guild.id, customCommand);
      if (response) {
        interaction.reply(response);
      } else {
        interaction.reply({ content: `Custom command "${customCommand}" not found.`, ephemeral: true });
      }
    } catch (error) {
      console.error('Error executing custom command:', error);
      interaction.reply({ content: 'An error occurred while executing the custom command. Please try again later.', ephemeral: true });
    }
  },
  executeSlashList: async (interaction) => {
    const customCommands = await getCustomCommands(interaction.guild.id);

    if (customCommands.length === 0) {
      return interaction.reply({ content: 'There are no custom commands for this server.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Custom Commands')
      .setDescription('Here is a list of all custom commands for this server:')
      .setColor('#0099ff')
      .setTimestamp();

    customCommands.forEach((command) => {
      embed.addFields({ name: command.command, value: command.response });
    });

    interaction.reply({ embeds: [embed] });
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'add':
        await module.exports.executeSlashAdd(interaction);
        break;
      case 'remove':
        await module.exports.executeSlashRemove(interaction);
        break;
      case 'execute':
        await module.exports.executeSlashExecute(interaction);
        break;
      case 'list':
        await module.exports.executeSlashList(interaction);
        break;
      default:
        interaction.reply({ content: 'Invalid subcommand. Please use "add", "remove", "execute", or "list".', ephemeral: true });
    }
  },
};
