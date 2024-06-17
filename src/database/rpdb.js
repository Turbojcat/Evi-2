const fs = require("fs");
const path = require("path");

async function initializeRPDatabase(bot) {
  const queriesFilePath = path.join(__dirname, "../commands/roleplay/queries.json");
  const queries = JSON.parse(fs.readFileSync(queriesFilePath, "utf8"));

  for (const queryName in queries) {
    if (queries.hasOwnProperty(queryName)) {
      const query = queries[queryName];
      bot.queries[queryName] = query;
    }
  }

  console.log("\x1b[32m[VALID]\x1b[33m Starter : RP database initialized");
}

async function createRPCommand(bot, commandName) {
  const createCommand = `ALTER TABLE profil ADD ${commandName}_p INT(200) NOT NULL DEFAULT 0, ADD ${commandName}_v INT(200) NOT NULL DEFAULT 0;`;

  try {
    await bot.db.query(createCommand);
  } catch (err) {
    console.error(`The creation of the new RP command ${commandName} failed:`, err);
  }

  const pQuery = `UPDATE profil SET ${commandName}_p=${commandName}_p+1 WHERE user_id=?`;
  const pQueryName = `update_${commandName}_p`;
  const vQuery = `UPDATE profil SET ${commandName}_v=${commandName}_v+1 WHERE user_id=?`;
  const vQueryName = `update_${commandName}_v`;

  const queriesFilePath = path.join(__dirname, "../commands/roleplay/queries.json");
  const queries = JSON.parse(fs.readFileSync(queriesFilePath, "utf8"));

  if (!queries[pQueryName] && !queries[vQueryName]) {
    queries[pQueryName] = pQuery;
    queries[vQueryName] = vQuery;

    fs.writeFileSync(queriesFilePath, JSON.stringify(queries, Object.keys(queries).sort(), 4), "utf-8");
    bot.queries[pQueryName] = pQuery;
    bot.queries[vQueryName] = vQuery;
  }
}

module.exports = {
  initializeRPDatabase,
  createRPCommand,
};
