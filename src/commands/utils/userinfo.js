// src/commands/utils/userinfo.js
const { EmbedBuilder } = require('discord.js');
const { getUserProfile } = require('../../database/userProfiles');
const moment = require('moment');

module.exports = {
  name: 'userinfo',
  description: 'Displays information about a user',
  usage: '<user|username|usertag|userID>',
  aliases: ['ui', 'memberinfo'],
  permissions: [],
  execute: async (message, args, bot) => {
    let userArray = message.content.split(" ");
    let userArgs = userArray.slice(1);
    let member = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0]) || message.member;

    if (member.presence.status === 'dnd') member.presence.status = '🔴 Do Not Disturb';
    if (member.presence.status === 'online') member.presence.status = '🟢 Online';
    if (member.presence.status === 'idle') member.presence.status = '🟡 Idle';
    if (member.presence.status === 'offline') member.presence.status = '⚫ Offline';

    let createdAt = moment.duration(moment().diff(moment(member.user.createdAt)));
    let joinedAt = moment.duration(moment().diff(moment(message.guild.members.cache.get(member.id).joinedAt)));
    const sjoined = (joinedAt.years() > 0 ? joinedAt.years() + " year" + (joinedAt.years() > 1 ? "s" : "") + " " : "") +
                    (joinedAt.months() > 0 ? joinedAt.months() + " month" + (joinedAt.months() > 1 ? "s" : "") + " " : "") +
                    (joinedAt.days() > 0 ? joinedAt.days() + " day" + (joinedAt.days() > 1 ? "s" : "") : "") + " ago";
    const ajoined = (createdAt.years() > 0 ? createdAt.years() + " year" + (createdAt.years() > 1 ? "s" : "") + " " : "") +
                    (createdAt.months() > 0 ? createdAt.months() + " month" + (createdAt.months() > 1 ? "s" : "") + " " : "") +
                    (createdAt.days() > 0 ? createdAt.days() + " day" + (createdAt.days() > 1 ? "s" : "") : "") + " ago";

    const joineddate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss");
    let status = member.presence.status;
    let nickname = message.guild.members.cache.get(member.id).nickname;

    const userProfile = await getUserProfile(member.user.id, message.guild.id);

    const embed = new EmbedBuilder()
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: `User info requested by ${message.author.tag} | ${message.author.username} | ${message.author.id}` })
      .setColor('#0099ff')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Info about ${member.user.username}`)
      .addFields(
        { name: '🆔 Member ID', value: member.id, inline: true },
        { name: '✏️ Member name/nickname', value: `${member.user.username}/${nickname ? nickname : "None"}`, inline: true },
        { name: '🔰 Roles', value: `<@&${member._roles.join('> <@&')}>` },
        { name: '🗓️ Account Created On:', value: `${moment.utc(member.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")} \n> ${ajoined}`, inline: true },
        { name: '🗓️ Joined the server At', value: `${joineddate} \n> ${sjoined}`, inline: true },
        { name: '🎮 Status', value: status },
        { name: 'About Me', value: userProfile.aboutMe || 'Not set', inline: false },
        {
          name: 'Links',
          value: userProfile.links && userProfile.links.length > 0 ? userProfile.links.join('\n') : 'Not set',
          inline: false
        },
        // { name: 'Birthday', value: userProfile.birthday || 'Not set', inline: true },
        {
          name: 'Interests',
          value: userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests.join(', ') : 'Not set',
          inline: false
        },
        { name: 'Story', value: userProfile.story || 'Not set', inline: false },
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

    message.channel.send({ embeds: [embed] });
  },
  data: {
    name: 'userinfo',
    description: 'Displays information about a user',
    options: [
      {
        name: 'user',
        type: 3, // STRING
        description: 'The user to display information about (mention, username, user tag, or user ID)',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction, bot) => {
    const search = interaction.options.getString('user');
    let member = interaction.guild.members.cache.find(
      (member) =>
        member.user.username.toLowerCase() === search.toLowerCase() ||
        member.user.tag.toLowerCase() === search.toLowerCase() ||
        member.id === search
    );

    if (!member) {
      return interaction.reply({ content: 'Please provide a valid user, username, user tag, or user ID.', ephemeral: true });
    }

    if (member.presence.status === 'dnd') member.presence.status = '🔴 Do Not Disturb';
    if (member.presence.status === 'online') member.presence.status = '🟢 Online';
    if (member.presence.status === 'idle') member.presence.status = '🟡 Idle';
    if (member.presence.status === 'offline') member.presence.status = '⚫ Offline';

    let createdAt = moment.duration(moment().diff(moment(member.user.createdAt)));
    let joinedAt = moment.duration(moment().diff(moment(member.joinedAt)));
    const sjoined = (joinedAt.years() > 0 ? joinedAt.years() + " year" + (joinedAt.years() > 1 ? "s" : "") + " " : "") +
                    (joinedAt.months() > 0 ? joinedAt.months() + " month" + (joinedAt.months() > 1 ? "s" : "") + " " : "") +
                    (joinedAt.days() > 0 ? joinedAt.days() + " day" + (joinedAt.days() > 1 ? "s" : "") : "") + " ago";
    const ajoined = (createdAt.years() > 0 ? createdAt.years() + " year" + (createdAt.years() > 1 ? "s" : "") + " " : "") +
                    (createdAt.months() > 0 ? createdAt.months() + " month" + (createdAt.months() > 1 ? "s" : "") + " " : "") +
                    (createdAt.days() > 0 ? createdAt.days() + " day" + (createdAt.days() > 1 ? "s" : "") : "") + " ago";

    const joineddate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss");
    let status = member.presence.status;
    let nickname = member.nickname;

    const userProfile = await getUserProfile(member.user.id, interaction.guild.id);

    const embed = new EmbedBuilder()
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: `User info requested by ${interaction.user.tag} | ${interaction.user.username} | ${interaction.user.id}` })
      .setColor('#0099ff')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Info about ${member.user.username}`)
      .addFields(
        { name: '🆔 Member ID', value: member.id, inline: true },
        { name: '✏️ Member name/nickname', value: `${member.user.username}/${nickname ? nickname : "None"}`, inline: true },
        { name: '🔰 Roles', value: `<@&${member._roles.join('> <@&')}>` },
        { name: '🗓️ Account Created On:', value: `${moment.utc(member.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")} \n> ${ajoined}`, inline: true },
        { name: '🗓️ Joined the server At', value: `${joineddate} \n> ${sjoined}`, inline: true },
        { name: '🎮 Status', value: status },
        { name: 'About Me', value: userProfile.aboutMe || 'Not set', inline: false },
        {
          name: 'Links',
          value: userProfile.links && userProfile.links.length > 0 ? userProfile.links.join('\n') : 'Not set',
          inline: false
        },
        // { name: 'Birthday', value: userProfile.birthday || 'Not set', inline: true },
        {
          name: 'Interests',
          value: userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests.join(', ') : 'Not set',
          inline: false
        },
        { name: 'Story', value: userProfile.story || 'Not set', inline: false },
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

    interaction.reply({ embeds: [embed] });
  },
};
