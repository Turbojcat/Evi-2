// src/commands/moderation/moderationRole.js
const { setModeratorRole, getModeratorRole, removeModeratorRole } = require('../../database/database');

module.exports = {
  name: 'moderationrole',
  description: 'Manages the moderator role for the server',
  usage: '<add|remove> [role]',
  aliases: ['modrole', 'mr'],
  permissions: ['MANAGE_GUILD'],
  permissionLevel: ['admin'],
  execute: async (message, args) => {
    const subcommand = args[0];
    const roleInput = args[1];

    if (subcommand === 'add') {
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

      getModeratorRole(message.guild.id, (currentModeratorRole) => {
        if (currentModeratorRole) {
          message.reply(`The moderator role is already set to <@&${currentModeratorRole}>. Please remove it before setting a new one.`);
        } else {
          setModeratorRole(message.guild.id, roleId, () => {
            message.reply(`Set the moderator role to <@&${roleId}>.`);
          });
        }
      });
    } else if (subcommand === 'remove') {
      getModeratorRole(message.guild.id, (currentModeratorRole) => {
        if (currentModeratorRole) {
          removeModeratorRole(message.guild.id, () => {
            message.reply(`Removed the moderator role <@&${currentModeratorRole}>.`);
          });
        } else {
          message.reply('There is no moderator role set.');
        }
      });
    } else {
      message.reply('Invalid subcommand. Please use `add` or `remove`.');
    }
  },
  data: {
    name: 'moderationrole',
    description: 'Manages the moderator role for the server',
    options: [
      {
        name: 'add',
        type: 1, // SUB_COMMAND
        description: 'Adds the moderator role for the server',
        options: [
          {
            name: 'role',
            type: 8, // ROLE
            description: 'The role to set as the moderator role',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        type: 1, // SUB_COMMAND
        description: 'Removes the moderator role for the server',
      },
    ],
  },
  executeSlash: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const roleId = interaction.options.getRole('role').id;

      getModeratorRole(interaction.guild.id, (currentModeratorRole) => {
        if (currentModeratorRole) {
          interaction.reply(`The moderator role is already set to <@&${currentModeratorRole}>. Please remove it before setting a new one.`);
        } else {
          setModeratorRole(interaction.guild.id, roleId, () => {
            interaction.reply(`Set the moderator role to <@&${roleId}>.`);
          });
        }
      });
    } else if (subcommand === 'remove') {
      getModeratorRole(interaction.guild.id, (currentModeratorRole) => {
        if (currentModeratorRole) {
          removeModeratorRole(interaction.guild.id, () => {
            interaction.reply(`Removed the moderator role <@&${currentModeratorRole}>.`);
          });
        } else {
          interaction.reply('There is no moderator role set.');
        }
      });
    }
  },
};
