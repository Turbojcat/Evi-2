// src/commands/moderation/adminRole.js
const { setAdminRole, getAdminRole, removeAdminRole } = require('../../database/database');
const { hasPremiumSubscription } = require('../../database/database');

module.exports = {
  name: 'adminrole',
  description: 'Manages the admin roles for the server (Free to use has 1 role u can sett. premium have 5.)',
  usage: '<add|remove|list> [role]',
  aliases: ['ar'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['owner'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

    const isPremium = await hasPremiumSubscription(message.author.id);
    const maxRoles = isPremium ? 5 : 1;

    if (subcommand === 'add') {
      if (!roleInput) {
        return message.reply('Please provide a role to add as an admin role.');
      }

      let roleId;
      if (roleInput.startsWith('<@&') && roleInput.endsWith('>')) {
        roleId = roleInput.slice(3, -1);
      } else if (message.guild.roles.cache.has(roleInput)) {
        roleId = roleInput;
      } else {
        const role = message.guild.roles.cache.find(r => r.name === roleInput);
        if (role) {
          roleId = role.id;
        }
      }

      if (!roleId) {
        return message.reply('Invalid role. Please provide a valid role mention, ID, or name.');
      }

      const currentAdminRoles = await getAdminRole(message.guild.id);

      if (currentAdminRoles && currentAdminRoles.length >= maxRoles) {
        return message.reply(`You can only add up to ${maxRoles} admin role(s). Please remove a role before adding a new one.`);
      }

      await setAdminRole(message.guild.id, roleId);
      message.reply(`Added <@&${roleId}> as an admin role.`);
    } else if (subcommand === 'remove') {
      if (!roleInput) {
        return message.reply('Please provide a role to remove from admin roles.');
      }

      let roleId;
      if (roleInput.startsWith('<@&') && roleInput.endsWith('>')) {
        roleId = roleInput.slice(3, -1);
      } else if (message.guild.roles.cache.has(roleInput)) {
        roleId = roleInput;
      } else {
        const role = message.guild.roles.cache.find(r => r.name === roleInput);
        if (role) {
          roleId = role.id;
        }
      }

      if (!roleId) {
        return message.reply('Invalid role. Please provide a valid role mention, ID, or name.');
      }

      await removeAdminRole(message.guild.id, roleId);
      message.reply(`Removed <@&${roleId}> from admin roles.`);
    } else if (subcommand === 'list') {
      const adminRoles = await getAdminRole(message.guild.id);

      if (!adminRoles || adminRoles.length === 0) {
        message.reply('There are no admin roles set.');
      } else {
        const roleList = adminRoles.map(roleId => `<@&${roleId}>`).join(', ');
        message.reply(`Current admin roles: ${roleList}`);
      }
    } else {
      message.reply('Invalid subcommand. Please use `add`, `remove`, or `list`.');
    }
  },
  data: {
    name: 'adminrole',
    description: 'Manages the admin roles for the server (Free to use has 1 role u can sett. premium have 5.)',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds an admin role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to add as an admin role',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes an admin role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to remove from admin roles',
            required: true,
          },
        ],
      },
      {
        name: 'list',
        type: 1, // SUB_COMMAND
        description: 'Lists all admin roles for the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const roleInput = interaction.options.getRole('role');

    const isPremium = await hasPremiumSubscription(interaction.user.id);
    const maxRoles = isPremium ? 5 : 1;

    if (subcommand === 'add') {
      const currentAdminRoles = await getAdminRole(interaction.guild.id);

      if (currentAdminRoles && currentAdminRoles.length >= maxRoles) {
        return interaction.reply({ content: `You can only add up to ${maxRoles} admin role(s). Please remove a role before adding a new one.`, ephemeral: true });
      }

      await setAdminRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Added <@&${roleInput.id}> as an admin role.`);
    } else if (subcommand === 'remove') {
      await removeAdminRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Removed <@&${roleInput.id}> from admin roles.`);
    } else if (subcommand === 'list') {
      const adminRoles = await getAdminRole(interaction.guild.id);

      if (!adminRoles || adminRoles.length === 0) {
        interaction.reply('There are no admin roles set.');
      } else {
        const roleList = adminRoles.map(roleId => `<@&${roleId}>`).join(', ');
        interaction.reply(`Current admin roles: ${roleList}`);
      }
    }
  },
};