// src/config.js
require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  prefix: '!',
  developerIDs: process.env.DEVELOPER_IDS ? process.env.DEVELOPER_IDS.split(',') : [],
  RPaddUserID: process.env.RP_ADD_USER_IDS ? process.env.RP_ADD_USER_IDS.split(',') : [],
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackUrl: process.env.CALLBACK_URL,
  sessionSecret: process.env.SESSION_SECRET,
  suggestionChannelId: '1243887358974234674',
  blacklistLogChannelId: '1243887500737511498',
  approvedSuggestionChannelId: '1250635932021817395',
  deniedSuggestionChannelId: '1250636001332953118',
  discordRulesRoleId: '1250826285379227659',
  eviRulesRoleId: '1250826886783696977',
  dbConfig: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  },
  colors: {
    red: '#FF0000', // Red
    green: '#00FF00', // Green
    blue: '#0000FF', // Blue
    yellow: '#FFFF00', // Yellow
    purple: '#800080', // Purple
    orange: '#FFA500', // Orange
    cyan: '#00FFFF', // Cyan
    magenta: '#FF00FF', // Magenta
    lime: '#00FF00', // Lime
    pink: '#FFC0CB', // Pink
  },
};
