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

function addFieldsToPage(page, fields, maxFieldsPerPage) {
  const remainingFields = fields.slice(page.fields?.length || 0);

  if (remainingFields.length > 0) {
    const fieldsToAdd = remainingFields.slice(0, maxFieldsPerPage - (page.fields?.length || 0));
    page.addFields(fieldsToAdd);
  }
}

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
      .setDescription(`Description: ${command.description}\nUsage: \`${prefix}${command.name} ${command.usage || ''}\`\nPremium: ${command.premium ? 'Yes' : (command.premiumPerks ? 'Both' : 'No')}`)
      .setTimestamp()
      .setFooter({ text: 'Continued in the next embed...' });

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
    const maxFieldsPerPage = 10;

    let totalCommands = 0;
    let totalAliases = 0;

    for (const [category, commands] of Object.entries(categories)) {
      const commandFields = commands.map(command => {
        return {
          name: `\`${command.name}\``,
          value: `Description: ${command.description}\nUsage: \`${prefix}${command.name} ${command.usage || ''}\`\nPremium: ${command.premium ? 'Yes' : (command.premiumPerks ? 'Both' : 'No')}`,
        };
      });

      let currentPage = pages[pages.length - 1];
      if (!currentPage || (currentPage.fields && currentPage.fields.length + commandFields.length > maxFieldsPerPage)) {
        currentPage = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Command List')
          .setDescription(`Total Commands: \`${totalCommands}\`\nTotal Aliases: \`${totalAliases}\``)
          .setThumbnail('https://cdn.discordapp.com/attachments/1243553220387803206/1243553264494968923/03cb6922d5bd77418daa85e22319ca08ef5c713a.jpg?ex=66684e3a&is=6666fcba&hm=39e24df505244b6bf9b0cc597a788fe55bb1eeeb17b6c43488780e7b187b77c9&')
          .setTimestamp();

        pages.push(currentPage);
      }

      currentPage.addFields({ name: `${category.toUpperCase()}`, value: '\u200B' });
      addFieldsToPage(currentPage, commandFields, maxFieldsPerPage);

      totalCommands += commands.length;
      totalAliases += commands.reduce((sum, command) => sum + (command.aliases ? command.aliases.length : 0), 0);
    }

    let currentPage = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setLabel('Join Evi\'s Support server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/6tnqjeRach'),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages.length === 1)
    );

    const helpMessage = await message.channel.send({ embeds: [pages[currentPage]], components: [row] });

    const collector = helpMessage.createMessageComponentCollector({ componentType: 2, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'previous') {
        currentPage--;
      } else if (interaction.customId === 'next') {
        currentPage++;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[2].setDisabled(currentPage === pages.length - 1);

      await interaction.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', async () => {
      row.components.forEach((component) => component.setDisabled(true));
      await helpMessage.edit({ components: [row] });
    });
  }
}
function addFieldsToPage(page, fields, maxFieldsPerPage) {
  const remainingFields = fields.slice(page.fields?.length || 0);

  if (remainingFields.length > 0) {
    const fieldsToAdd = remainingFields.slice(0, maxFieldsPerPage - (page.fields?.length || 0));
    page.addFields(fieldsToAdd);
  }
}

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
      .setDescription(`Description: ${command.description}\nUsage: \`${prefix}${command.name} ${command.usage || ''}\`\nPremium: ${command.premium ? 'Yes' : (command.premiumPerks ? 'Both' : 'No')}`)
      .setTimestamp()
      .setFooter({ text: 'Continued in the next embed...' });

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
    const maxFieldsPerPage = 10;

    let totalCommands = 0;
    let totalAliases = 0;

    for (const [category, commands] of Object.entries(categories)) {
      const commandFields = commands.map(command => {
        return {
          name: `\`${command.name}\``,
          value: `Description: ${command.description}\nUsage: \`${prefix}${command.name} ${command.usage || ''}\`\nPremium: ${command.premium ? 'Yes' : (command.premiumPerks ? 'Both' : 'No')}`,
        };
      });

      let currentPage = pages[pages.length - 1];
      if (!currentPage || (currentPage.fields && currentPage.fields.length + commandFields.length > maxFieldsPerPage)) {
        currentPage = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Command List')
          .setDescription(`Total Commands: \`${totalCommands}\`\nTotal Aliases: \`${totalAliases}\``)
          .setThumbnail('https://cdn.discordapp.com/attachments/1243553220387803206/1243553264494968923/03cb6922d5bd77418daa85e22319ca08ef5c713a.jpg?ex=66684e3a&is=6666fcba&hm=39e24df505244b6bf9b0cc597a788fe55bb1eeeb17b6c43488780e7b187b77c9&')
          .setTimestamp();

        pages.push(currentPage);
      }

      currentPage.addFields({ name: `${category.toUpperCase()}`, value: '\u200B' });
      addFieldsToPage(currentPage, commandFields, maxFieldsPerPage);

      totalCommands += commands.length;
      totalAliases += commands.reduce((sum, command) => sum + (command.aliases ? command.aliases.length : 0), 0);
    }

    let currentPage = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setLabel('Join Evi\'s Support server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/6tnqjeRach'),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages.length === 1)
    );

    const helpMessage = await message.channel.send({ embeds: [pages[currentPage]], components: [row] });

    const collector = helpMessage.createMessageComponentCollector({ componentType: 2, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'previous') {
        currentPage--;
      } else if (interaction.customId === 'next') {
        currentPage++;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[2].setDisabled(currentPage === pages.length - 1);

      await interaction.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', async () => {
      row.components.forEach((component) => component.setDisabled(true));
      await helpMessage.edit({ components: [row] });
    });
  }
}
