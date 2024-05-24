// src/commands/utils/help.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { prefix, premiumRoleId } = require('../../config');

module.exports = {
    name: 'help',
    description: 'Displays the list of available commands or information about a specific command.',
    usage: '[command]',
    aliases: ['commands'],
    cooldown: 5,
    permissions: [],
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
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    const isPremiumUser = message.member.roles.cache.has(premiumRoleId);

    if (commandName) {
        const command = commands.get(commandName.toLowerCase()) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()));
        if (!command) {
            return message.reply(`No information found for command: \`${commandName}\``);
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Command: ${command.name}`)
            .setDescription(command.description)
            .addFields(
                { name: 'Usage', value: `\`${prefix}${command.name} ${command.usage || ''}\``, inline: true },
                { name: 'Aliases', value: command.aliases ? command.aliases.join(', ') : 'None', inline: true },
                { name: 'Cooldown', value: `${command.cooldown || 0} second(s)`, inline: true },
                { name: 'Permissions', value: command.permissions ? command.permissions.join(', ') : 'None', inline: true },
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
            .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}`)
            .setTimestamp();

        const commandsPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(commandsPath);
        const pages = [];
        let currentPage = 0;

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
            const commandList = commandFiles.map(file => `\`${file.slice(0, -3)}\``).join(', ');
            
            if (folder === 'developer' && !developerIDs.includes(message.author.id)) {
                continue;
            }
            
            if (folder === 'premium' && !isPremiumUser) {
                continue;
            }
            
            if (embed.data && embed.data.fields && (embed.data.fields.length === 25 || (folder === commandFolders[commandFolders.length - 1] && embed.data.fields.length + 1 === 25))) {
                pages.push(embed);
                embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Command List')
                    .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}`)
                    .setTimestamp();
            }
            
            embed.addFields({ name: folder.toUpperCase(), value: commandList || 'No commands in this category.' });
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

        collector.on('collect', async interaction => {
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
            row.components.forEach(component => component.setDisabled(true));
            await helpMessage.edit({ components: [row] });
        });
    }
}

async function executeSlash(interaction, client, commands, slashCommands) {
    const { options } = interaction;
    const commandName = options.getString('command');
    const developerIDs = process.env.DEVELOPER_IDS.split(',');
    const isPremiumUser = interaction.member.roles.cache.has(premiumRoleId);

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
                { name: 'Cooldown', value: `${command.cooldown || 0} second(s)`, inline: true },
                { name: 'Permissions', value: command.permissions ? command.permissions.join(', ') : 'None', inline: true },
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
            .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}`)
            .setTimestamp();

        const commandsPath = path.join(__dirname, '..');
        const commandFolders = fs.readdirSync(commandsPath);
        const pages = [];
        let currentPage = 0;

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
            const commandList = commandFiles.map(file => `\`${file.slice(0, -3)}\``).join(', ');
            
            if (folder === 'developer' && !developerIDs.includes(interaction.user.id)) {
                continue;
            }
            
            if (folder === 'premium' && !isPremiumUser) {
                continue;
            }
            
            if (embed.data && embed.data.fields && (embed.data.fields.length === 25 || (folder === commandFolders[commandFolders.length - 1] && embed.data.fields.length + 1 === 25))) {
                pages.push(embed);
                embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Command List')
                    .setDescription(`Here's a list of all available commands:\n\nTotal commands: ${commandCount}\nTotal aliases: ${aliasCount}`)
                    .setTimestamp();
            }
            
            embed.addFields({ name: folder.toUpperCase(), value: commandList || 'No commands in this category.' });
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

        collector.on('collect', async interaction => {
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
            row.components.forEach(component => component.setDisabled(true));
            await helpMessage.edit({ components: [row] });
        });
    }
}
