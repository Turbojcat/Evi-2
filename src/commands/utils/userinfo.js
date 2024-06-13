// src/commands/utils/userinfo.js
const { EmbedBuilder } = require('discord.js');
const { getUserProfile } = require('../../database/userProfiles');

module.exports = {
  name: 'userinfo',
  description: 'Displays information about a user',
  usage: '<user|username|usertag|userID>',
  aliases: ['ui'],
  permissions: [],
  execute: async (message, args) => {
    let user = message.mentions.users.first();

    if (!user) {
      const search = args.join(' ');
      const member = message.guild.members.cache.find(
        (member) =>
          member.user.username.toLowerCase() === search.toLowerCase() ||
          member.user.tag.toLowerCase() === search.toLowerCase() ||
          member.id === search
      );
      if (member) {
        user = member.user;
      }
    }

    if (!user) {
      return message.channel.send('Please provide a valid user, username, user tag, or user ID.');
    }

    const userProfile = await getUserProfile(user.id, message.guild.id);
    const member = message.guild.members.cache.get(user.id);

    console.log('User:', user);
    console.log('User Profile:', userProfile);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Profile`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Username', value: user.tag || 'Unknown', inline: true },
        { name: 'User ID', value: user.id || 'Unknown', inline: true },
        { name: 'Account Created', value: user.createdAt ? user.createdAt.toDateString() : 'Unknown', inline: true },
        { name: 'Joined Server', value: member && member.joinedAt ? member.joinedAt.toDateString() : 'Unknown', inline: true },
        {
          name: 'Roles',
          value: member && member.roles.cache ? member.roles.cache.map(role => role.name).join(', ') : 'None',
          inline: true
        },
        { name: 'Highest Role', value: member && member.roles.highest ? member.roles.highest.name : 'None', inline: true },
        { name: 'About Me', value: userProfile.aboutMe || 'Not set', inline: false },
        {
          name: 'Links',
          value: userProfile.links && userProfile.links.length > 0 ? userProfile.links.join('\n') : 'Not set',
          inline: false
        },
        // { name: 'Birthday', value: userProfile.birthday || 'Not set', inline: true },
        // { name: 'Location', value: userProfile.location || 'Not set', inline: true },
        {
          name: 'Interests',
          value: userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests.join(', ') : 'Not set',
          inline: false
        },
        { name: 'Story', value: userProfile.story || 'Not set', inline: false },
      )
      .setTimestamp();

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
  executeSlash: async (interaction) => {
    const search = interaction.options.getString('user');
    let user = interaction.guild.members.cache.find(
      (member) =>
        member.user.username.toLowerCase() === search.toLowerCase() ||
        member.user.tag.toLowerCase() === search.toLowerCase() ||
        member.id === search
    )?.user;

    if (!user) {
      return interaction.reply({ content: 'Please provide a valid user, username, user tag, or user ID.', ephemeral: true });
    }

    const userProfile = await getUserProfile(user.id, interaction.guild.id);
    const member = interaction.guild.members.cache.get(user.id);

    console.log('User:', user);
    console.log('User Profile:', userProfile);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Profile`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Username', value: user.tag || 'Unknown', inline: true },
        { name: 'User ID', value: user.id || 'Unknown', inline: true },
        { name: 'Account Created', value: user.createdAt ? user.createdAt.toDateString() : 'Unknown', inline: true },
        { name: 'Joined Server', value: member && member.joinedAt ? member.joinedAt.toDateString() : 'Unknown', inline: true },
        {
          name: 'Roles',
          value: member && member.roles.cache ? member.roles.cache.map(role => role.name).join(', ') : 'None',
          inline: true
        },
        { name: 'Highest Role', value: member && member.roles.highest ? member.roles.highest.name : 'None', inline: true },
        { name: 'About Me', value: userProfile.aboutMe || 'Not set', inline: false },
        {
          name: 'Links',
          value: userProfile.links && userProfile.links.length > 0 ? userProfile.links.join('\n') : 'Not set',
          inline: false
        },
        // { name: 'Birthday', value: userProfile.birthday || 'Not set', inline: true },
        // { name: 'Location', value: userProfile.location || 'Not set', inline: true },
        {
          name: 'Interests',
          value: userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests.join(', ') : 'Not set',
          inline: false
        },
        { name: 'Story', value: userProfile.story || 'Not set', inline: false },
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};