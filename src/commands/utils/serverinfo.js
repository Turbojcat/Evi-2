const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

const filterLevels = {
  DISABLED: 'Off',
  MEMBERS_WITHOUT_ROLES: 'No Role',
  ALL_MEMBERS: 'Everyone'
};

const verificationLevels = {
  NONE: 'None',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: '(╯°□°）╯︵ ┻━┻',
  VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = {
  name: 'serverinfo',
  description: 'Displays information about the server',
  aliases: ['si', 'guildinfo'],
  execute: async (message) => {
    const guild = message.guild;
    const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
    const members = guild.members.cache;
    const channels = guild.channels.cache;
    const emojis = guild.emojis.cache;

    const serverCreated = moment.duration(moment().diff(moment(guild.createdTimestamp)));
    const createdString = (serverCreated.years() > 0 ? serverCreated.years() + " year" + (serverCreated.years() > 1 ? "s" : "") + " " : "") +
                          (serverCreated.months() > 0 ? serverCreated.months() + " month" + (serverCreated.months() > 1 ? "s" : "") + " " : "") +
                          (serverCreated.days() > 0 ? serverCreated.days() + " day" + (serverCreated.days() > 1 ? "s" : "") : "") + " ago";

    const embed = new EmbedBuilder()
      .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
      .setTimestamp()
      .setFooter({ text: `Server info requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setColor('#0099ff')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`**Guild information for __${guild.name}__**`)
      .addFields(
        {
          name: '📋 General',
          value: [
            `**❯ ⌨️ Name:** ${guild.name}`,
            `**❯ 🆔 ID:** ${guild.id}`,
            `**❯ 👥 Owner:** ${guild.ownerId}`,
            `**❯ 💜 Boost Tier:** ${guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None'}`,
            `**❯ ⚙ Explicit Filter:** ${filterLevels[guild.explicitContentFilter]}`,
            `**❯ ⚙ Verification Level:** ${verificationLevels[guild.verificationLevel]}`,
            `**❯ ⏲️ Time Created:** ${moment(guild.createdTimestamp).format("dddd, MMMM Do YYYY, HH:mm:ss")} ${moment(guild.createdTimestamp).format('LL')} ${createdString}`,
            '\u200b'
          ].join('\n')
        },
        {
          name: '🌐 Statistics',
          value: [
            `**❯ 🔰 Role Count:** ${roles.length}`,
            `**❯ 🙂 Emoji Count:** ${emojis.size}`,
            `**❯ 🙂 Regular Emoji Count:** ${emojis.filter(emoji => !emoji.animated).size}`,
            `**❯ 🙂 Animated Emoji Count:** ${emojis.filter(emoji => emoji.animated).size}`,
            `**❯ 👥 Member Count:** ${guild.memberCount}`,
            `**❯ 👥 Humans:** ${members.filter(member => !member.user.bot).size}`,
            `**❯ 🤖 Bots:** ${members.filter(member => member.user.bot).size}`,
            `**❯ 📁 Text Channels:** ${channels.filter(channel => channel.type === 0).size}`,
            `**❯ 🔊 Voice Channels:** ${channels.filter(channel => channel.type === 2).size}`,
            `**❯ 👥 Boost Count:** ${guild.premiumSubscriptionCount || '0'}`,
            '\u200b'
          ].join('\n')
        },
        {
          name: '🎮 Presence',
          value: [
            `**❯ 🟢 Online:** ${members.filter(member => member.presence?.status === 'online').size}`,
            `**❯ 🟡 Idle:** ${members.filter(member => member.presence?.status === 'idle').size}`,
            `**❯ 🔴 Do Not Disturb:** ${members.filter(member => member.presence?.status === 'dnd').size}`,
            `**❯ ⚫ Offline:** ${members.filter(member => member.presence?.status === 'offline').size}`,
            '\u200b'
          ].join('\n')
        },
        {
          name: '📥 Invite me!',
          value: '[Click me to invite Evi to your server!](https://discord.com/api/oauth2/authorize?client_id=804424228022648832&permissions=8&scope=bot)',
          inline: false
        },
        {
          name: '🆘 Support Server',
          value: '[Click here to join Evi\'s support server](https://discord.gg/6tnqjeRach)',
          inline: false
        },
        {
          name: '🔗 Helpful Links',
          value: [
            '• [Vote for Evi on top.gg](https://top.gg/bot/804424228022648832/vote)',
            '• [Visit Evi\'s website](https://your-website-url.com)',
            '• [Support Evi on Patreon](https://www.patreon.com/your-patreon-url)'
          ].join('\n'),
          inline: false
        }
      );

    await message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'serverinfo',
    description: 'Displays information about the server',
  },
  executeSlash: async (interaction) => {
    const guild = interaction.guild;
    const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
    const members = guild.members.cache;
    const channels = guild.channels.cache;
    const emojis = guild.emojis.cache;

    const serverCreated = moment.duration(moment().diff(moment(guild.createdTimestamp)));
    const createdString = (serverCreated.years() > 0 ? serverCreated.years() + " year" + (serverCreated.years() > 1 ? "s" : "") + " " : "") +
                          (serverCreated.months() > 0 ? serverCreated.months() + " month" + (serverCreated.months() > 1 ? "s" : "") + " " : "") +
                          (serverCreated.days() > 0 ? serverCreated.days() + " day" + (serverCreated.days() > 1 ? "s" : "") : "") + " ago";

    const embed = new EmbedBuilder()
      .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
      .setTimestamp()
      .setFooter({ text: `Server info requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setColor('#0099ff')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`**Guild information for __${guild.name}__**`)
      .addFields(
        {
          name: '📋 General',
          value: [
            `**❯ ⌨️ Name:** ${guild.name}`,
            `**❯ 🆔 ID:** ${guild.id}`,
            `**❯ 👥 Owner:** ${guild.ownerId}`,
            `**❯ 💜 Boost Tier:** ${guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None'}`,
            `**❯ ⚙ Explicit Filter:** ${filterLevels[guild.explicitContentFilter]}`,
            `**❯ ⚙ Verification Level:** ${verificationLevels[guild.verificationLevel]}`,
            `**❯ ⏲️ Time Created:** ${moment(guild.createdTimestamp).format("dddd, MMMM Do YYYY, HH:mm:ss")} ${moment(guild.createdTimestamp).format('LL')} ${createdString}`,
            '\u200b'
          ].join('\n')
        },
        {
          name: '🌐 Statistics',
          value: [
            `**❯ 🔰 Role Count:** ${roles.length}`,
            `**❯ 🙂 Emoji Count:** ${emojis.size}`,
            `**❯ 🙂 Regular Emoji Count:** ${emojis.filter(emoji => !emoji.animated).size}`,
            `**❯ 🙂 Animated Emoji Count:** ${emojis.filter(emoji => emoji.animated).size}`,
            `**❯ 👥 Member Count:** ${guild.memberCount}`,
            `**❯ 👥 Humans:** ${members.filter(member => !member.user.bot).size}`,
            `**❯ 🤖 Bots:** ${members.filter(member => member.user.bot).size}`,
            `**❯ 📁 Text Channels:** ${channels.filter(channel => channel.type === 0).size}`,
            `**❯ 🔊 Voice Channels:** ${channels.filter(channel => channel.type === 2).size}`,
            `**❯ 👥 Boost Count:** ${guild.premiumSubscriptionCount || '0'}`,
            '\u200b'
          ].join('\n')
        },
        {
          name: '🎮 Presence',
          value: [
            `**❯ 🟢 Online:** ${members.filter(member => member.presence?.status === 'online').size}`,
            `**❯ 🟡 Idle:** ${members.filter(member => member.presence?.status === 'idle').size}`,
            `**❯ 🔴 Do Not Disturb:** ${members.filter(member => member.presence?.status === 'dnd').size}`,
            `**❯ ⚫ Offline:** ${members.filter(member => member.presence?.status === 'offline').size}`,
            '\u200b'
          ].join('\n')
        },
        {
          name: '📥 Invite me!',
          value: '[Click me to invite Evi to your server!](https://discord.com/api/oauth2/authorize?client_id=804424228022648832&permissions=8&scope=bot)',
          inline: false
        },
        {
          name: '🆘 Support Server',
          value: '[Click here to join Evi\'s support server](https://discord.gg/6tnqjeRach)',
          inline: false
        },
        {
          name: '🔗 Helpful Links',
          value: [
            '• [Vote for Evi on top.gg](https://top.gg/bot/804424228022648832/vote)',
            '• [Visit Evi\'s website](https://your-website-url.com)',
            '• [Support Evi on Patreon](https://www.patreon.com/your-patreon-url)'
          ].join('\n'),
          inline: false
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
