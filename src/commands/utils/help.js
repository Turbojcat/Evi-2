// src/commands/utils/help.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix, developerIDs } = require('../../config');
const { hasPremiumSubscription, getRolePermissionLevel } = require('../../database/database');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Displays the list of available commands or information about a specific command.',
  usage: '[command|category]',
  aliases: ['commands'],
  cooldown: 5,
  permissions: [],
  permissionLevel: ['normal'],
  execute: async (message, args, client, commands, slashCommands) => {
    if (!message.content.startsWith(prefix)) return;
    await executePrefix(message, args, client, commands, slashCommands);
  },
  data: {
    name: 'help',
    description: 'Displays the list of available commands or information about a specific command.',
    options: [
      {
        name: 'command',
        type: 3, // STRING
        description: 'The command to get information about.',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction, client, commands, slashCommands) => {
    await executeSlash(interaction, client, commands, slashCommands);
  },
};

async function executePrefix(message, args, client, commands, slashCommands) {
  const commandName = args[0];
  const isPremiumUser = await hasPremiumSubscription(message.author.id);
  const userPermissionLevel = await getRolePermissionLevel(message.guild.id, message.member.roles.highest.id);

  const adminLevels = ['admin', 'owner', 'moderator', 'normal'];
  if (module.exports.permissionLevel.length > 0 && !adminLevels.includes(userPermissionLevel)) {
    return message.channel.send('You do not have permission to use this command.');
  }

  if (commandName) {
    const command = commands[commandName.toLowerCase()];
    if (!command) {
      return message.channel.send(`No information found for command: \`${commandName}\``);
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Command: ${command.name}`)
      .setDescription(`${command.description}\n\nUsage: \`${prefix}${command.name} ${command.usage || ''}\``)
      .addFields(
        { name: 'Category', value: command.category ? command.category.toUpperCase() : 'None', inline: true },
        { name: 'Premium', value: command.premium ? 'Premium' : (command.premiumPerks ? 'Free / Premium' : 'Free'), inline: true },
        { name: '\u200B', value: '[Join Evi\'s Support server](https://discord.gg/6tnqjeRach)' }
      )
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  } else {
    const categories = {};

    const commandsPath = path.join(__dirname, '..');
    const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        const category = folder;

        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(command);
      }
    }

    const pages = [];

    for (const [category, commands] of Object.entries(categories)) {
      const commandList = commands.map(command => `\`${command.name}\``).join(', ');
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${category.toUpperCase()} Commands`)
        .setDescription(commandList)
        .setTimestamp();
      pages.push(embed);
    }

    if (pages.length === 0) {
      return message.channel.send('No commands found.');
    }

    let currentPage = 0;
    const row = new ActionRowBuilder();

    if (pages.length > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(false)
      );
    }

    const helpMessage = await message.channel.send({ embeds: [pages[currentPage]], components: pages.length > 1 ? [row] : [] });

    if (pages.length === 1) {
      return;
    }

    const collector = helpMessage.createMessageComponentCollector({ componentType: 2, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'previous') {
        currentPage--;
      } else if (interaction.customId === 'next') {
        currentPage++;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === pages.length - 1);

      await interaction.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', async () => {
      row.components.forEach((component) => component.setDisabled(true));
      await helpMessage.edit({ components: [row] });
    });
  }
}

async function executeSlash(interaction, client, commands, slashCommands) {
  const { options } = interaction;
  const commandName = options.getString('command');
  const isPremiumUser = await hasPremiumSubscription(interaction.user.id);
  const userPermissionLevel = await getRolePermissionLevel(interaction.guild.id, interaction.member.roles.highest.id);

  const adminLevels = ['admin', 'owner', 'moderator', 'normal'];
  if (module.exports.permissionLevel.length > 0 && !adminLevels.includes(userPermissionLevel)) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  if (commandName) {
    const command = slashCommands.get(commandName.toLowerCase());
    if (!command) {
      return interaction.reply({ content: `No information found for command: \`${commandName}\``, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Command: ${command.data.name}`)
      .setDescription(command.data.description)
      .addFields(
        { name: 'Category', value: command.category ? command.category.toUpperCase() : 'None', inline: true },
        { name: 'Premium', value: command.premium ? 'Premium' : (command.premiumPerks ? 'Free / Premium' : 'Free'), inline: true },
        { name: '\u200B', value: '[Join Evi\'s Support server](https://discord.gg/6tnqjeRach)' }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  } else {
    const categories = {};

    const commandsPath = path.join(__dirname, '..');
    const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        const category = folder;

        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(command);
      }
    }

    const pages = [];

    for (const [category, commands] of Object.entries(categories)) {
      const commandList = commands.map(command => `\`${command.data.name}\``).join(', ');
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${category.toUpperCase()} Commands`)
        .setDescription(commandList)
        .setTimestamp();
      pages.push(embed);
    }

    if (pages.length === 0) {
      return interaction.reply({ content: 'No commands found.', ephemeral: true });
    }

    let currentPage = 0;
    const row = new ActionRowBuilder();

    if (pages.length > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(false)
      );
    }

    const helpMessage = await interaction.reply({ embeds: [pages[currentPage]], components: pages.length > 1 ? [row] : [], fetchReply: true });

    if (pages.length === 1) {
      return;
    }

    const collector = helpMessage.createMessageComponentCollector({ componentType: 2, time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.customId === 'previous') {
        currentPage--;
      } else if (buttonInteraction.customId === 'next') {
        currentPage++;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === pages.length - 1);

      await buttonInteraction.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', async () => {
      row.components.forEach((component) => component.setDisabled(true));
      await helpMessage.edit({ components: [row] });
    });
  }
}
