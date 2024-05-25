// src/commands/utils/updateProfile.js
const { updateUserProfile } = require('../../database/userProfiles');

module.exports = {
  name: 'updateprofile',
  description: 'Updates your user profile',
  usage: '<about_me|links|interests|story> <value>',
  aliases: ['profile'],
  permissions: [],
  execute: async (message, args) => {
    const field = args[0];
    const value = args.slice(1).join(' ');

    if (!field || !value) {
      return message.channel.send('Please provide a valid field and value to update.');
    }

    const validFields = ['about_me', 'links', 'interests', 'story'];
    if (!validFields.includes(field)) {
      return message.channel.send(`Invalid field. Valid fields are: ${validFields.join(', ')}`);
    }

    const profileData = {
      [field]: field === 'links' || field === 'interests' ? value.split(',').map(item => item.trim()) : value,
    };

    try {
      await updateUserProfile(message.author.id, message.guild.id, profileData);
      message.channel.send('Your profile has been updated successfully!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      message.channel.send('An error occurred while updating your profile. Please try again later.');
    }
  },
  data: {
    name: 'updateprofile',
    description: 'Updates your user profile',
    options: [
      {
        name: 'field',
        type: 3, // STRING
        description: 'The field to update (about_me, links, interests, story)',
        required: true,
        choices: [
          {
            name: 'About Me',
            value: 'about_me',
          },
          {
            name: 'Links',
            value: 'links',
          },
          {
            name: 'Interests',
            value: 'interests',
          },
          {
            name: 'Story',
            value: 'story',
          },
        ],
      },
      {
        name: 'value',
        type: 3, // STRING
        description: 'The new value for the field',
        required: true,
      },
    ],
  },
  executeSlash: async (interaction) => {
    const field = interaction.options.getString('field');
    const value = interaction.options.getString('value');

    const profileData = {
      [field]: field === 'links' || field === 'interests' ? value.split(',').map(item => item.trim()) : value,
    };

    try {
      await updateUserProfile(interaction.user.id, interaction.guild.id, profileData);
      interaction.reply('Your profile has been updated successfully!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      interaction.reply('An error occurred while updating your profile. Please try again later.');
    }
  },
};