// src/evi.js
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { token } = require('./config');
const CommandHandler = require('./handler/commandHandler');
const path = require('path');
const { setupDatabase, pool, hasPremiumSubscription, addOwnerRole, createUserProfilesTable } = require('./database/database');
const { createWikiPageTable } = require('./database/wiki');
const { createWelcomeLeaveTable, getWelcomeMessage, getLeaveMessage } = require('./database/welcomeLeave');
const { replacePlaceholders } = require('./placeholders');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

const commandHandler = new CommandHandler(client);
const { commands } = commandHandler;
module.exports.commands = commands;

const activities = [
  { type: ActivityType.Playing, name: '!Help for commands!' },
  { type: ActivityType.Competing, name: 'For support join Evi support server! !support' },
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
  createUserProfilesTable();
  createWikiPageTable();
  createWelcomeLeaveTable();

  const { commandCount, aliasCount } = commandHandler.getCommandStats();
  console.log(`${client.user.tag} (${client.user.id}) is ready with ${commandCount} commands and ${aliasCount} aliases, serving ${client.guilds.cache.size} servers and ${client.users.cache.size} users!`);

  const rest = new REST({ version: '10' }).setToken(token);

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: [...commandHandler.slashCommands.values()].map(command => command.data),
      });

      console.log('Finished refreshing application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  commandHandler.handleCommand(message);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  commandHandler.handleSlashCommand(interaction);
});

client.on('guildMemberAdd', async (member) => {
  const guildId = member.guild.id;
  const welcomeMessage = await getWelcomeMessage(guildId);

  if (welcomeMessage) {
    const replacedMessage = replacePlaceholders(member, welcomeMessage);
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
    if (welcomeChannel) {
      welcomeChannel.send(replacedMessage);
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  const guildId = member.guild.id;
  const leaveMessage = await getLeaveMessage(guildId);

  if (leaveMessage) {
    const replacedMessage = replacePlaceholders(member, leaveMessage);
    const leaveChannel = member.guild.channels.cache.find(channel => channel.name === 'leave');
    if (leaveChannel) {
      leaveChannel.send(replacedMessage);
    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldPremiumStatus = await hasPremiumSubscription(oldMember.id);
  const newPremiumStatus = await hasPremiumSubscription(newMember.id);

  if (!oldPremiumStatus && newPremiumStatus) {
    // Perform actions for premium subscription activation
    // ...
  } else if (oldPremiumStatus && !newPremiumStatus) {
    // Perform actions for premium subscription deactivation
    // ...
  }
});

client.on('guildCreate', async (guild) => {
  const ownerId = guild.ownerId;
  const ownerMember = await guild.members.fetch(ownerId);

  if (ownerMember) {
    addOwnerRole(guild.id, ownerId);
  }
});

client.login(token);
