// src/evi.js
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config');
const CommandHandler = require('./handler/commandHandler');
const path = require('path');
const { setupDatabase } = require('./database/database');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences] });

const commandHandler = new CommandHandler(client);

const activities = [
    { type: ActivityType.Playing, name: '!Help for commands!' },
    { type: ActivityType.Competing, name: 'For support join Evi support server! !support' }
];

let currentActivity = 0;

function updateActivity() {
    const { commandCount, aliasCount } = commandHandler.getCommandStats();
    activities[1] = { type: ActivityType.Listening, name: `${commandCount} Commands & ${aliasCount} Alias!` };
    activities[2] = { type: ActivityType.Watching, name: `In ${client.guilds.cache.size} server & Watching ${client.users.cache.size}!` };
    activities[3] = { type: ActivityType.Competing, name: 'For support join Evi\'s support server! !support' };

    const activity = activities[currentActivity];
    client.user.setPresence({ activities: [activity] });
    currentActivity = (currentActivity + 1) % activities.length;
    setTimeout(updateActivity, 30000); // Update activity every 30 seconds
}

client.once('ready', () => {
    updateActivity();
    const commandsPath = path.join(__dirname, 'commands');
    commandHandler.loadCommands(commandsPath);
    setupDatabase();

    const { commandCount, aliasCount } = commandHandler.getCommandStats();
    console.log(`${client.user.tag} (${client.user.id}) is ready with ${commandCount} commands and ${aliasCount} aliases, serving ${client.guilds.cache.size} servers and ${client.users.cache.size} users!`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    commandHandler.handleCommand(message);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    commandHandler.handleSlashCommand(interaction);
});

client.login(token);
