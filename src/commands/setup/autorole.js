// src/commands/setup/autorole.js
const { addAutoRole, removeAutoRole, getAutoRoles } = require('../../database/autoroledb');
const { hasPremiumSubscription } = require('../../database/database');

const parseTime = (timeString) => {
  const regex = /(\d+)([mMdDwWyY])/g;
  let match;
  let duration = 0;

  while ((match = regex.exec(timeString))) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'm':
        duration += value * 60 * 1000;
        break;
      case 'd':
        duration += value * 24 * 60 * 60 * 1000;
        break;
      case 'w':
        duration += value * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'y':
        duration += value * 365 * 24 * 60 * 60 * 1000;
        break;
    }
  }

  return duration;
};

module.exports = {
  name: 'autorole',
  description: 'Manages automatic role assignment for new members',
  usage: '<roleTag/roleID> [duration]',
  aliases: ['ar'],
  permissions: ['MANAGE_ROLES'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];

    if (subcommand === 'list') {
      const autoRoles = await getAutoRoles(message.guild.id);
      if (autoRoles.length === 0) {
        return message.channel.send('There are no autoroles set up for this server.');
      }

      const roleList = autoRoles.map((autoRole) => {
        const role = message.guild.roles.cache.get(autoRole.role_id);
        const duration = autoRole.duration ? `${autoRole.duration}ms` : 'Permanent';
        return `- ${role} (${duration})`;
      });

      message.channel.send(`Autoroles for this server:\n${roleList.join('\n')}`);
    } else if (subcommand === 'remove') {
      const roleInput = args[1];
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(roleInput);

      if (!role) {
        return message.channel.send('Please provide a valid role tag or ID.');
      }

      await removeAutoRole(message.guild.id, role.id);
      message.channel.send(`Autorole for ${role} has been removed.`);
    } else {
      const roleInput = args[0];
      const durationInput = args.slice(1).join(' ');

      const role = message.mentions.roles.first() || message.guild.roles.cache.get(roleInput);

      if (!role) {
        return message.channel.send('Please provide a valid role tag or ID.');
      }

      const isPremium = await hasPremiumSubscription(message.author.id);
      const autoRoles = await getAutoRoles(message.guild.id);

      if (!isPremium && autoRoles.length >= 1) {
        return message.channel.send('You have reached the maximum number of autoroles for free users (1). Upgrade to premium for more autoroles.');
      } else if (isPremium && autoRoles.length >= 5) {
        return message.channel.send('You have reached the maximum number of autoroles for premium users (5).');
      }

      const duration = durationInput ? parseTime(durationInput) : null;

      await addAutoRole(message.guild.id, role.id, duration);
      const durationText = duration ? `for ${durationInput}` : 'permanently';
      message.channel.send(`Autorole for ${role} has been set up ${durationText}.`);
    }
  },
  data: {
    name: 'autorole',
    description: 'Manages automatic role assignment for new members',
    options: [
      {
        name: 'role',
        type: 8, // ROLE
        description: 'The role to assign automatically',
        required: true,
      },
      {
        name: 'duration',
        type: 3, // STRING
        description: 'The duration for temporary roles (e.g., 1m 2d 3w 4m 5y)',
        required: false,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const role = interaction.options.getRole('role');
    const durationInput = interaction.options.getString('duration');

    const isPremium = await hasPremiumSubscription(interaction.user.id);
    const autoRoles = await getAutoRoles(interaction.guild.id);

    if (!isPremium && autoRoles.length >= 1) {
      return interaction.reply('You have reached the maximum number of autoroles for free users (1). Upgrade to premium for more autoroles.');
    } else if (isPremium && autoRoles.length >= 5) {
      return interaction.reply('You have reached the maximum number of autoroles for premium users (5).');
    }

    const duration = durationInput ? parseTime(durationInput) : null;

    await addAutoRole(interaction.guild.id, role.id, duration);
    const durationText = duration ? `for ${durationInput}` : 'permanently';
    interaction.reply(`Autorole for ${role} has been set up ${durationText}.`);
  },
};
