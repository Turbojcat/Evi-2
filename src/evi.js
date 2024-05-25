// src/evi.js
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { token } = require('./config');
const CommandHandler = require('./handler/commandHandler');
const path = require('path');
const { setupDatabase, pool, hasPremiumSubscription, addOwnerRole, getWelcomeChannel, getWelcomeMessage, createUserProfilesTable } = require('./database/database');

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

  const { commandCount, aliasCount } = commandHandler.getCommandStats();
  console.log(`${client.user.tag} (${client.user.id}) is ready with ${commandCount} commands and ${aliasCount} aliases, serving ${client.guilds.cache.size} servers and ${client.users.cache.size} users!`);

  const rest = new REST({ version: '10' }).setToken(token);

  (async () => {
    try {
      console.log('Started refreshing application (/) commands.');

      for (const command of commandHandler.slashCommands.values()) {
        try {
          await rest.post(Routes.applicationCommands(client.user.id), {
            body: command.data,
          });
          console.log(`Successfully registered slash command: ${command.data.name}`);
        } catch (error) {
          console.error(`Error registering slash command: ${command.data.name}`);
          console.error(error);
        }
      }

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

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldPremiumStatus = await hasPremiumSubscription(oldMember.id);
  const newPremiumStatus = await hasPremiumSubscription(newMember.id);

  if (!oldPremiumStatus && newPremiumStatus) {
    console.log(`User ${newMember.user.tag} (${newMember.id}) gained premium subscription`);
    // Perform actions for premium subscription activation
    // ...
  } else if (oldPremiumStatus && !newPremiumStatus) {
    console.log(`User ${newMember.user.tag} (${newMember.id}) lost premium subscription`);
    // Perform actions for premium subscription deactivation
    // ...
  }
});

client.on('guildCreate', async (guild) => {
  const ownerId = guild.ownerId;
  const ownerMember = await guild.members.fetch(ownerId);

  if (ownerMember) {
    addOwnerRole(guild.id, ownerId, () => {
      console.log(`Added owner role for user ${ownerMember.user.tag} (${ownerId}) in guild ${guild.name} (${guild.id})`);
    });
  }
});

client.on('guildMemberAdd', async (member) => {
  const welcomeChannelId = await getWelcomeChannel(member.guild.id);
  const welcomeMessage = await getWelcomeMessage(member.guild.id);

  if (welcomeChannelId && welcomeMessage) {
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      const formattedMessage = welcomeMessage
        .replace('{user}', member.user.toString())
        .replace('{server}', member.guild.name);
      welcomeChannel.send(formattedMessage);
    }
  }
});

client.login(token)