// src/handler/commandHandler.js
const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { prefix } = require('../config');
const { hasPremiumSubscription, getRolePermissionLevel, executeCustomCommand } = require('../database/database');

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.cooldowns = new Collection();
  }

  loadCommands(commandsPath) {
    const commandFiles = this.getCommandFiles(commandsPath);

    for (const filePath of commandFiles) {
      const command = require(filePath);
      if (command.data) {
        this.slashCommands.set(command.data.name, command);
      }
      if (command.name) {
        this.commands.set(command.name, command);
        if (command.aliases) {
          command.aliases.forEach((alias) => {
            if (!this.commands.has(alias)) {
              this.commands.set(alias, command);
            } else {
              const conflictingCommand = this.commands.get(alias);
              console.warn(`Alias "${alias}" for command "${command.name}" conflicts with command "${conflictingCommand.name}". Skipping...`);
            }
          });
        }
      }
    }
  }

  getCommandFiles(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    let commandFiles = [];

    for (const file of files) {
      const filePath = path.join(directory, file.name);

      if (file.isDirectory()) {
        commandFiles = [...commandFiles, ...this.getCommandFiles(filePath)];
      } else if (file.name.endsWith('.js')) {
        commandFiles.push(filePath);
      }
    }

    return commandFiles;
  }

  async handleCommand(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = this.commands.get(commandName) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
      const customResponse = await executeCustomCommand(message.guild.id, commandName);
      if (customResponse) {
        return message.channel.send(customResponse);
      } else {
        return;
      }
    }

    console.log(`Checking premium subscription for user: ${message.author.id}`);
    const isPremiumUser = await hasPremiumSubscription(message.author.id);
    console.log(`isPremiumUser: ${isPremiumUser}`);

    if (command.premium && !isPremiumUser) {
      return message.channel.send('This command is only available for premium users.');
    }

    const isServerOwner = message.guild.ownerId === message.author.id;

    if (isServerOwner) {
      this.executeCommand(message, args, command);
    } else {
      try {
        const userPermissionLevel = await getRolePermissionLevel(message.guild.id, message.member.roles.highest.id);
        if (command.permissionLevel && command.permissionLevel.includes(userPermissionLevel)) {
          this.executeCommand(message, args, command);
        } else {
          return message.channel.send('You do not have permission to use this command.');
        }
      } catch (error) {
        console.error('Error checking user permission level:', error);
        return message.channel.send('An error occurred while checking your permissions.');
      }
    }
  }

  async handleSlashCommand(interaction) {
    if (!interaction.isCommand()) return;

    const command = this.slashCommands.get(interaction.commandName);

    if (!command) {
      return;
    }

    console.log(`Checking premium subscription for user: ${interaction.user.id}`);
    const isPremiumUser = await hasPremiumSubscription(interaction.user.id);
    console.log(`isPremiumUser: ${isPremiumUser}`);

    if (command.premium && !isPremiumUser) {
      return interaction.reply({ content: 'This command is only available for premium users.', ephemeral: true });
    }

    const isServerOwner = interaction.guild.ownerId === interaction.user.id;

    if (isServerOwner) {
      this.executeSlashCommand(interaction, command);
    } else {
      try {
        const userPermissionLevel = await getRolePermissionLevel(interaction.guild.id, interaction.member.roles.highest.id);
        if (command.permissionLevel && command.permissionLevel.includes(userPermissionLevel)) {
          this.executeSlashCommand(interaction, command);
        } else {
          return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
      } catch (error) {
        console.error('Error checking user permission level:', error);
        return interaction.reply({ content: 'An error occurred while checking your permissions.', ephemeral: true });
      }
    }
  }

  executeCommand(message, args, command) {
    if (!this.cooldowns.has(command.name)) {
      this.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.channel.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      command.execute(message, args, this.client);
    } catch (error) {
      console.error('Error executing command:', error);
      message.channel.send('There was an error trying to execute that command!');
    }
  }

  async executeSlashCommand(interaction, command) {
    if (!this.cooldowns.has(command.data.name)) {
      this.cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`, ephemeral: true });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.executeSlash(interaction, this.client);
    } catch (error) {
      console.error('Error executing slash command:', error);
      await interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
    }
  }
}

module.exports = CommandHandler;
