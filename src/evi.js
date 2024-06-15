// src/evi.js
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { token, suggestionChannelId, approvedSuggestionChannelId, deniedSuggestionChannelId } = require('./config');
const CommandHandler = require('./handler/commandHandler');
const path = require('path');
const { setupDatabase, createUserProfilesTable } = require('./database/database');
const { createWikiPageTable } = require('./database/wiki');
const { createWelcomeLeaveTable, getWelcomeMessage, getLeaveMessage } = require('./database/welcomeLeave');
const { replacePlaceholders } = require('./placeholders');
const { createAdminModRolesTable } = require('./database/adminModRoles');
const { createSuggestionTable } = require('./database/suggestiondb');
const { getNewSuggestions, markSuggestionAsSent, updateSuggestionStatus } = require('./database/suggestiondb');
const { getReactionRoles } = require('./database/reactionroledb');
const { createAutoRoleTable } = require('./database/autoroledb');
const { getAutoRoles } = require('./database/autoroledb');
const { createEconomyTable, createEcoSettingsTable } = require('./database/ecodb');
const { createEmbedTable } = require('./database/embeddb');
const { setupInventoryDatabase } = require('./database/inventorydb');
const { createShopItemTable, createShopCategoryTable, createShopPurchaseTable, dropShopItemTable } = require('./database/shopdb');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
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

async function sendSuggestionsToEvi(client) {
  const suggestionChannel = client.channels.cache.get(suggestionChannelId);

  if (!suggestionChannel) {
    console.error('Suggestion channel not found on Evi\'s server.');
    return;
  }

  const newSuggestions = await getNewSuggestions();

  for (const suggestion of newSuggestions) {
    const { id, user_id, guild_id, suggestion: suggestionText } = suggestion;

    const guild = client.guilds.cache.get(guild_id);
    const user = await client.users.fetch(user_id);

    const embed = new EmbedBuilder()
      .setTitle('New Suggestion')
      .setDescription(suggestionText)
      .addFields(
        { name: 'Server', value: guild ? `${guild.name} (${guild.id})` : 'Unknown' },
        { name: 'User', value: user ? `${user.tag} (${user.id})` : 'Unknown' }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${id}`)
          .setLabel('Approve')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`deny_${id}`)
          .setLabel('Deny')
          .setStyle(ButtonStyle.Danger)
      );

    try {
      await suggestionChannel.send({ embeds: [embed], components: [row] });
      await markSuggestionAsSent(id);
    } catch (error) {
      console.error('Error sending suggestion to Evi\'s server:', error);
    }
  }
}

client.once('ready', async () => {
  updateActivity();
  const commandsPath = path.join(__dirname, 'commands');
  commandHandler.loadCommands(commandsPath);

  try {
    await setupDatabase();
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }

  createUserProfilesTable();
  createWikiPageTable();
  createWelcomeLeaveTable();
  createAdminModRolesTable();
  createSuggestionTable();
  createAutoRoleTable();
  createEconomyTable();
  createEcoSettingsTable();

  try {
    await createEmbedTable();
    console.log('Custom embeds table created successfully');
  } catch (error) {
    console.error('Error creating custom embeds table:', error);
  }

  try {
    await setupInventoryDatabase();
    console.log('Inventory database setup completed');
  } catch (error) {
    console.error('Error setting up inventory database:', error);
  }

  try {
    await createShopCategoryTable();
    await dropShopItemTable();
    await createShopItemTable();
    await createShopPurchaseTable();
    console.log('Shop tables created successfully');
  } catch (error) {
    console.error('Error creating shop tables:', error);
  }

  const { commandCount, aliasCount } = commandHandler.getCommandStats();
  console.log(`${client.user.tag} (${client.user.id}) is ready with ${commandCount} commands and ${aliasCount} aliases, serving ${client.guilds.cache.size} servers and ${client.users.cache.size} users!`);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: [...commandHandler.slashCommands.values()].map(command => command.data),
    });

    console.log('Finished refreshing application (/) commands.');
  } catch (error) {
    console.error(error);
  }

  setInterval(() => {
    sendSuggestionsToEvi(client);
  }, 30 * 1000); // Check for new suggestions every 30 seconds
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  commandHandler.handleCommand(message);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    commandHandler.handleSlashCommand(interaction);
  } else if (interaction.isButton()) {
    const [action, suggestionId] = interaction.customId.split('_');

    if (action === 'approve') {
      const suggestionChannel = client.channels.cache.get(suggestionChannelId);
      const approvedChannel = client.channels.cache.get(approvedSuggestionChannelId);

      if (suggestionChannel && approvedChannel) {
        try {
          const suggestionMessage = await suggestionChannel.messages.fetch(interaction.message.id);
          const suggestionEmbed = suggestionMessage.embeds[0];

          const approvedEmbed = new EmbedBuilder()
            .setTitle('Approved Suggestion')
            .setDescription(suggestionEmbed.description)
            .setTimestamp();

          await updateSuggestionStatus(suggestionId, 'approved');
          await approvedChannel.send({ embeds: [approvedEmbed] });
          await interaction.update({ components: [] });
        } catch (error) {
          console.error('Error handling suggestion approval:', error);
          await interaction.reply({ content: 'An error occurred while approving the suggestion. Please try again later.', ephemeral: true });
        }
      } else {
        await interaction.reply({ content: 'The suggestion or approved channel is not configured properly. Please contact an administrator.', ephemeral: true });
      }
    } else if (action === 'deny') {
      const suggestionChannel = client.channels.cache.get(suggestionChannelId);
      const deniedChannel = client.channels.cache.get(deniedSuggestionChannelId);

      if (suggestionChannel && deniedChannel) {
        try {
          const suggestionMessage = await suggestionChannel.messages.fetch(interaction.message.id);
          const suggestionEmbed = suggestionMessage.embeds[0];

          const deniedEmbed = new EmbedBuilder()
            .setTitle('Denied Suggestion')
            .setDescription(suggestionEmbed.description)
            .setTimestamp();

          await updateSuggestionStatus(suggestionId, 'denied');
          await deniedChannel.send({ embeds: [deniedEmbed] });
          await interaction.update({ components: [] });
        } catch (error) {
          console.error('Error handling suggestion denial:', error);
          await interaction.reply({ content: 'An error occurred while denying the suggestion. Please try again later.', ephemeral: true });
        }
      } else {
        await interaction.reply({ content: 'The suggestion or denied channel is not configured properly. Please contact an administrator.', ephemeral: true });
      }
    }
  }
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

  const autoRoles = await getAutoRoles(member.guild.id);
  for (const autoRole of autoRoles) {
    const role = member.guild.roles.cache.get(autoRole.role_id);
    if (role) {
      if (autoRole.duration) {
        await member.roles.add(role, `Autorole for ${autoRole.duration}ms`);
        setTimeout(() => {
          member.roles.remove(role, 'Autorole duration expired');
        }, autoRole.duration);
      } else {
        await member.roles.add(role, 'Permanent autorole');
      }
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

client.on('messageReactionAdd', async (reaction, user) => {
  console.log('messageReactionAdd event triggered');

  if (user.bot) return;

  const { message } = reaction;
  const { guild } = message;

  console.log('Guild ID:', guild.id);
  console.log('Message ID:', message.id);
  const reactionRoles = await getReactionRoles(guild.id, message.id);
  console.log('Reaction Roles from DB:', reactionRoles);
  console.log('Reaction Emoji:', reaction.emoji.name);

  // Check if the message has any reaction roles set up
  if (reactionRoles.length === 0) return;

  let emojiIdentifier = reaction.emoji.name;
  if (reaction.emoji.id) {
    emojiIdentifier = reaction.emoji.id;
  }
  const reactionRole = reactionRoles.find(rr => rr.emoji === emojiIdentifier);

  console.log('Reaction Role:', reactionRole);

  if (reactionRole) {
    const member = await guild.members.fetch(user.id);
    console.log('Member:', member);

    const role = guild.roles.cache.get(reactionRole.role_id);
    console.log('Role:', role);

    if (role && member) {
      await member.roles.add(role);
    }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  console.log('messageReactionRemove event triggered');

  if (user.bot) return;

  const { message } = reaction;
  const { guild } = message;

  console.log('Guild ID:', guild.id);
  console.log('Message ID:', message.id);
  const reactionRoles = await getReactionRoles(guild.id, message.id);
  console.log('Reaction Roles from DB:', reactionRoles);
  console.log('Reaction Emoji:', reaction.emoji.name);

  // Check if the message has any reaction roles set up
  if (reactionRoles.length === 0) return;

  let emojiIdentifier = reaction.emoji.name;
  if (reaction.emoji.id) {
    emojiIdentifier = reaction.emoji.id;
  }
  const reactionRole = reactionRoles.find(rr => rr.emoji === emojiIdentifier);

  console.log('Reaction Role:', reactionRole);

  if (reactionRole) {
    const member = await guild.members.fetch(user.id);
    console.log('Member:', member);

    const role = guild.roles.cache.get(reactionRole.role_id);
    console.log('Role:', role);

    if (role && member) {
      await member.roles.remove(role);
    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldPremiumStatus = await hasPremiumSubscription(oldMember.id);
  const newPremiumStatus = await hasPremiumSubscription(newMember.id);

  if (!oldPremiumStatus && newPremiumStatus) {
    // Perform actions for premium subscription activation
  } else if (oldPremiumStatus && !newPremiumStatus) {
    // Perform actions for premium subscription deactivation
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
