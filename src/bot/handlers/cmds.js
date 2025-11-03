const discord = require(`discord.js`),
    { readdirSync } = require(`fs`);

module.exports = async (bot) => {
    const path = readdirSync('./src/bot/cmds/').filter(x => x.endsWith(`.js`)),
        commands = [];

    for (let file of path) {
        const cmd = require(`../cmds/${file}`);
        bot.cmds.set(cmd.data.name, cmd)
        commands.push(cmd.data.toJSON());
        if (cmd.aliases && Array.isArray(cmd.aliases)) {
            cmd.aliases.forEach(alias => {
                bot.aliases.set(alias, cmd);
            });
        }
    }

    const rest = new discord.REST({ version: 10 }).setToken(process.env.token);

    try {
        console.log(`carregando comandos...`);
        await rest.put(discord.Routes.applicationCommands(process.env.id), { body: commands });
        console.log(`comandos carregados ✔`);
    } catch (err) {
        console.log(err);
    }
}