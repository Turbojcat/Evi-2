// src/config.js
require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  prefix: '!',
  developerIDs: process.env.DEVELOPER_IDS ? process.env.DEVELOPER_IDS.split(',') : [],
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
};