// src/commands/utils/ping.js
module.exports = {
    name: 'ping',
    description: 'Displays the latency of the bot and the API',
    execute: async (message) => {
        const reply = await message.channel.send('Pinging...');
        const timeDiff = reply.createdTimestamp - message.createdTimestamp;
        const botPing = Math.round(message.client.ws.ping);
        const responseText = `Pong! 🏓 Latency is ${timeDiff}ms. API Latency is ${botPing}ms.`;
        await reply.edit(responseText);
    },
    data: {
        name: 'ping',
        description: 'Displays the latency of the bot and the API',
    },
    executeSlash: async (interaction) => {
        await interaction.reply('Pinging...');
        const reply = await interaction.fetchReply();
        const timeDiff = reply.createdTimestamp - interaction.createdTimestamp;
        const botPing = Math.round(interaction.client.ws.ping);
        const responseText = `Pong! 🏓 Latency is ${timeDiff}ms. API Latency is ${botPing}ms.`;
        await interaction.editReply(responseText);
    },
};
