// src/commands/utils/help.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { prefix, developerIDs } = require('../../config');
const { hasPremiumSubscription, getRolePermissionLevel } = require('../../database/database');

module.exports = {
  name: 'help',
  description: 'Displays the list of available commands or information about a specific command.',
  usage: '[command|category]',
  aliases: ['commands'],
  cooldown: 5,
  permissions: [],
  permissionLevel: ['normal'], // Tilnærming 1: Legg til "admin" i permissionLevel arrayen
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
    console.log('executeSlash function called');
    await executeSlash(interaction, client, commands, slashCommands);
  },
};

async function executePrefix(message, args, client, commands, slashCommands) {
  console.log('executePrefix function called');
  const commandName = args[0];
  const isPremiumUser = await hasPremiumSubscription(message.author.id);
  const userPermissionLevel = await getRolePermissionLevel(message.guild.id, message.member.roles.highest.id);

  console.log('User permission level:', userPermissionLevel);
  console.log('Required permission level:', module.exports.permissionLevel);

  // Tilnærming 3: Endre logikken for tilgangssjekken
  const adminLevels = ['admin', 'owner', 'moderator', 'normal'];
  if (module.exports.permissionLevel.length > 0 && !adminLevels.includes(userPermissionLevel)) {
    console.log('User does not have the required permission level');
    return message.reply('You do not have permission to use this command.');
  }

  if (commandName) {
    const command = commands.get(commandName.toLowerCase()) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()));
    if (!command) {
      console.log(`No command found for: ${commandName}`);
      return message.reply(`No information found for command: \`${commandName}\``);
    }

    console.log(`Found command: ${command.name}`);
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Command: ${command.name}`)
      .setDescription(`${command.description}\n\nAliases: ${command.aliases ? command.aliases.join(', ') : 'None'}\n\nUsage: \`${prefix}${command.name} ${command.usage || ''}\``)
      .addFields(
        { name: 'Cooldown', value: `${command.cooldown || 0} second(s)`, inline: true },
        { name: 'Premium', value: command.premium ? 'Yes' : 'No', inline: true },
        { name: 'Permission Level', value: command.permissionLevel ? command.permissionLevel.join(', ') : 'normal', inline: true },
        { name: 'Category', value: command.category ? command.category.toUpperCase() : 'None', inline: true },
        { name: '\u200B', value: '[Join Evi\'s Support server](https://discord.gg/6tnqjeRach)' }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  } else {
    const commandCount = commands.size;
    const aliasCount = commands.reduce((acc, cmd) => acc + (cmd.aliases ? cmd.aliases.length : 0), 0);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Command List')
      .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}\n\n**^** - Free command\n**^^** - Premium command`)
      .setTimestamp();

    const commandsPath = path.join(__dirname, '..');
    const commandFolders = fs.readdirSync(commandsPath);
    const pages = [];
    let currentPage = 0;

    for (const folder of commandFolders) {
      if (folder === 'developer' && !developerIDs.includes(message.author.id)) {
        console.log('User is not a developer, skipping developer commands');
        continue;
      }

      const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter((file) => file.endsWith('.js'));
      const commandFields = [];

      for (const file of commandFiles) {
        const commandName = file.slice(0, -3);
        const command = commands.get(commandName);
        if (!command) {
          console.log(`Command not found: ${commandName}`);
          continue;
        }
        const isPremium = command.premium;
        const hasPermission = command.permissionLevel ? command.permissionLevel.includes(userPermissionLevel) : true;
        command.category = folder; // Legg til kategori basert på mappenavn
        if (hasPermission) {
          commandFields.push({ name: `\`${commandName}\`${isPremium ? " ^^" : " ^"}`, value: command.description });
        } else {
          console.log(`User does not have permission for command: ${commandName}`);
        }
      }

      if (commandFields.length > 0) {
        if (embed.data && embed.data.fields && (embed.data.fields.length + commandFields.length > 25 || (folder === commandFolders[commandFolders.length - 1] && embed.data.fields.length + commandFields.length > 25))) {
          console.log('Embedding fields limit reached, creating a new page');
          pages.push(embed);
          embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Command List')
            .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}\n\n**^** - Free command\n**^^** - Premium command`)
            .setTimestamp();
        }

        embed.addFields({ name: `${folder.toUpperCase()} Commands`, value: '\u200B' });
        console.log('Command Fields:', commandFields);
        embed.addFields(...commandFields);
      } else {
        console.log(`No commands found for category: ${folder}`);
      }
    }

    embed.addFields({ name: '\u200B', value: '[Join Evi\'s Support server](https://discord.gg/6tnqjeRach)' });
    pages.push(embed);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === pages.length - 1)
      );

    const helpMessage = await message.reply({ embeds: [pages[currentPage]], components: [row] });

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
      console.log('Help message collector ended');
      row.components.forEach((component) => component.setDisabled(true));
      await helpMessage.edit({ components: [row] });
    });
  }
}

async function executeSlash(interaction, client, commands, slashCommands) {
  console.log('executeSlash function called');
  const { options } = interaction;
  const commandName = options.getString('command');
  const isPremiumUser = await hasPremiumSubscription(interaction.user.id);
  const userPermissionLevel = await getRolePermissionLevel(interaction.guild.id, interaction.member.roles.highest.id);

  console.log('User permission level:', userPermissionLevel);
  console.log('Required permission level:', module.exports.permissionLevel);

  // Tilnærming 3: Endre logikken for tilgangssjekken
  const adminLevels = ['admin', 'owner', 'moderator', 'normal'];
  if (module.exports.permissionLevel.length > 0 && !adminLevels.includes(userPermissionLevel)) {
    console.log('User does not have the required permission level');
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  if (commandName) {
    const command = slashCommands.get(commandName.toLowerCase());
    if (!command) {
      console.log(`No slash command found for: ${commandName}`);
      return interaction.reply({ content: `No information found for command: \`${commandName}\``, ephemeral: true });
    }

    console.log(`Found slash command: ${command.data.name}`);
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Command: ${command.data.name}`)
      .setDescription(command.data.description)
      .addFields(
        { name: 'Cooldown', value: `${command.cooldown || 0} second(s)`, inline: true },
        { name: 'Premium', value: command.premium ? 'Yes' : 'No', inline: true },
        { name: 'Permission Level', value: command.permissionLevel ? command.permissionLevel.join(', ') : 'normal', inline: true },
        { name: 'Category', value: command.category ? command.category.toUpperCase() : 'None', inline: true },
        { name: '\u200B', value: '[Join Evi\'s Support server](https://discord.gg/6tnqjeRach)' }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  } else {
    const commandCount = slashCommands.size;
    const aliasCount = slashCommands.reduce((acc, cmd) => acc + (cmd.aliases ? cmd.aliases.length : 0), 0);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Command List')
      .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}\n\n**^** - Free command\n**^^** - Premium command`)
      .setTimestamp();

    const commandsPath = path.join(__dirname, '..');
    const commandFolders = fs.readdirSync(commandsPath);
    const pages = [];
    let currentPage = 0;

    for (const folder of commandFolders) {
      if (folder === 'developer' && !developerIDs.includes(interaction.user.id)) {
        console.log('User is not a developer, skipping developer commands');
        continue;
      }

      const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter((file) => file.endsWith('.js'));
      const commandFields = [];

      for (const file of commandFiles) {
        const commandName = file.slice(0, -3);
        const command = slashCommands.get(commandName);
        if (!command) {
          console.log(`Command not found: ${commandName}`);
          continue;
        }
        const isPremium = command.premium;
        const hasPermission = command.permissionLevel ? command.permissionLevel.includes(userPermissionLevel) : true;
        command.category = folder; // Legg til kategori basert på mappenavn
        if (hasPermission) {
          commandFields.push({ name: `\`${commandName}\`${isPremium ? " ^^" : " ^"}`, value: command.data.description });
        } else {
          console.log(`User does not have permission for command: ${commandName}`);
        }
      }

      if (commandFields.length > 0) {
        if (embed.data && embed.data.fields && (embed.data.fields.length + commandFields.length > 25 || (folder === commandFolders[commandFolders.length - 1] && embed.data.fields.length + commandFields.length > 25))) {
          console.log('Embedding fields limit reached, creating a new page');
          pages.push(embed);
          embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Command List')
            .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}\n\n**^** - Free command\n**^^** - Premium command`)
            .setTimestamp();
        }

        embed.addFields({ name: `${folder.toUpperCase()} Commands`, value: '\u200B' });
        console.log('Command Fields:', commandFields);
        embed.addFields(...commandFields);
      } else {
        console.log(`No commands found for category: ${folder}`);
      }
    }

    embed.addFields({ name: '\u200B', value: '[Join Evi\'s Support server](https://discord.gg/6tnqjeRach)' });
    pages.push(embed);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === pages.length - 1)
      );

    const helpMessage = await interaction.reply({ embeds: [pages[currentPage]], components: [row], fetchReply: true });

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
      console.log('Help message collector ended');
      row.components.forEach((component) => component.setDisabled(true));
      await helpMessage.edit({ components: [row] });
    });
  }
}