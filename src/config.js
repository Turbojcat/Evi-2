require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  prefix: '!', // Definer ønsket prefix her
  developerIDs: process.env.DEVELOPER_IDS.split(','),
  dbConfig: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  }
};
