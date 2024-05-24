// src/evi.js
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { token, premiumRoleId } = require('./config');
const CommandHandler = require('./handler/commandHandler');
const path = require('path');
const { setupDatabase, pool } = require('./database/database');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers] });

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

async function getPremiumRoleId(guildId) {
  const query = 'SELECT role_id FROM premium_role WHERE guild_id = ?';
  const results = await pool.query(query, [guildId]);
  return results[0]?.role_id;
}

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const premiumRoleId = await getPremiumRoleId(newMember.guild.id);
  if (!premiumRoleId) return;

  const hasPremiumRole = newMember.roles.cache.has(premiumRoleId);
  const hadPremiumRole = oldMember.roles.cache.has(premiumRoleId);

  if (hasPremiumRole && !hadPremiumRole) {
      // User gained the premium role
      await addPremiumUser(newMember.guild.id, newMember.id);
  } else if (!hasPremiumRole && hadPremiumRole) {
      // User lost the premium role
      await removePremiumUser(newMember.guild.id, newMember.id);
  }
});

async function addPremiumUser(guildId, userId) {
    const query = 'INSERT INTO premium_users (guild_id, user_id) VALUES (?, ?)';
    await pool.query(query, [guildId, userId]);
}

async function removePremiumUser(guildId, userId) {
    const query = 'DELETE FROM premium_users WHERE guild_id = ? AND user_id = ?';
    await pool.query(query, [guildId, userId]);
}

client.login(token);
