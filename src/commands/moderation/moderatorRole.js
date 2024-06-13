// src/commands/moderation/moderatorRole.js
const { setModeratorRole, getModeratorRoles, removeModeratorRole } = require('../../database/adminModRoles');

module.exports = {
  name: 'moderatorrole',
  description: 'Manages the moderator roles for the server',
  usage: '<add|remove|list> [role]',
  aliases: ['modrole', 'mr'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

    if (subcommand === 'add') {
      if (!roleInput) {
        return message.channel.send('Please provide a role to add as a moderator role.');
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
        return message.channel.send('Invalid role. Please provide a valid role mention, ID, or name.');
      }

      await setModeratorRole(message.guild.id, roleId);
      message.channel.send(`Added <@&${roleId}> as a moderator role.`);
    } else if (subcommand === 'remove') {
      if (!roleInput) {
        return message.channel.send('Please provide a role to remove from moderator roles.');
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
        return message.channel.send('Invalid role. Please provide a valid role mention, ID, or name.');
      }

      await removeModeratorRole(message.guild.id, roleId);
      message.channel.send(`Removed <@&${roleId}> from moderator roles.`);
    } else if (subcommand === 'list') {
      const moderatorRoles = await getModeratorRoles(message.guild.id);

      if (moderatorRoles.length === 0) {
        message.channel.send('There are no moderator roles set.');
      } else {
        const roleList = moderatorRoles.map(roleId => `<@&${roleId}>`).join(', ');
        message.channel.send(`Current moderator roles: ${roleList}`);
      }
    } else {
      message.channel.send('Invalid subcommand. Please use "add", "remove", or "list".');
    }
  },
  data: {
    name: 'moderatorrole',
    description: 'Manages the moderator roles for the server',
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

    if (subcommand === 'add') {
      await setModeratorRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Added ${roleInput} as a moderator role.`);
    } else if (subcommand === 'remove') {
      await removeModeratorRole(interaction.guild.id, roleInput.id);
      interaction.reply(`Removed ${roleInput} from moderator roles.`);
    } else if (subcommand === 'list') {
      const moderatorRoles = await getModeratorRoles(interaction.guild.id);

      if (moderatorRoles.length === 0) {
        interaction.reply('There are no moderator roles set.');
      } else {
        const roleList = moderatorRoles.map(roleId => `<@&${roleId}>`).join(', ');
        interaction.reply(`Current moderator roles: ${roleList}`);
      }
    }
  },
};
