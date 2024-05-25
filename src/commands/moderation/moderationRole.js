// src/commands/moderation/moderationRole.js
const { setModeratorRole, getModeratorRole, removeModeratorRole } = require('../../database/database');
const { hasPremiumSubscription } = require('../../database/database');

module.exports = {
  name: 'moderationrole',
  description: 'Manages the moderator roles for the server (Free to use has 1 role u can sett. premium have 5.)',
  usage: '<add|remove|list> [role]',
  aliases: ['modrole', 'mr'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

    const isPremium = await hasPremiumSubscription(message.author.id);
    const maxRoles = isPremium ? 5 : 1;

    if (subcommand === 'add') {
      if (!roleInput) {
        return message.reply('Please provide a role to add as a moderator role.');
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

      const currentModeratorRoles = await getModeratorRole(message.guild.id);

      if (currentModeratorRoles && currentModeratorRoles.length >= maxRoles) {
        return message.reply(`You can only add up to ${maxRoles} moderator role(s). Please remove a role before adding a new one.`);
      }

      await setModeratorRole(message.guild.id, roleId);
      message.reply(`Added <@&${roleId}> as a moderator role.`);
    } else if (subcommand === 'remove') {
      if (!roleInput) {
        return message.reply('Please provide a role to remove from moderator roles.');
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

      await removeModeratorRole(message.guild.id, roleId);
      message.reply(`Removed <@&${roleId}> from moderator roles.`);
    } else if (subcommand === 'list') {
      const moderatorRoles = await getModeratorRole(message.guild.id);

      if (!moderatorRoles || moderatorRoles.length === 0) {
        message.reply('There are no moderator roles set.');
      } else {
        const roleList = moderatorRoles.map(roleId => `<@&${roleId}>`).join(', ');
        message.reply(`Current moderator roles: ${roleList}`);
      }
    } else {
      message.reply('Invalid subcommand. Please use `add`, `remove`, or `list`.');
    }
  },
  data: {
    name: 'moderationrole',
    description: 'Manages the moderator roles for the server (Free to use has 1 role u can sett. premium have 5.)',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds a moderator role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to add as a moderator role',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes a moderator role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to remove from moderator roles',
            required: true,
          },
        ],
      },
      {
        name: 'list',
        type: 1, // SUB_COMMAND
        description: 'Lists all moderator roles for the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const roleInput = interaction.options.getRole('role');

    const isPremium = await hasPremiumSubscription(interaction.user.id);
    const maxRoles = isPremium ? 5 : 1;

    if (subcommand === 'add') {
      const currentModeratorRoles = await getModeratorRole(interaction.guild.id);

      if (currentModeratorRoles && currentModeratorRoles.length >= maxRoles) {
        return interaction.reply({ content: `You can only add up to ${maxRoles} moderator role(s). Please remove a role before adding a new one.`, ephemeral: true });
      }

      await setModeratorRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Added <@&${roleInput.id}> as a moderator role.`);
    } else if (subcommand === 'remove') {
      await removeModeratorRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Removed <@&${roleInput.id}> from moderator roles.`);
    } else if (subcommand === 'list') {
      const moderatorRoles = await getModeratorRole(interaction.guild.id);

      if (!moderatorRoles || moderatorRoles.length === 0) {
        interaction.reply('There are no moderator roles set.');
      } else {
        const roleList = moderatorRoles.map(roleId => `<@&${roleId}>`).join(', ');
        interaction.reply(`Current moderator roles: ${roleList}`);
      }
    }
  },
};