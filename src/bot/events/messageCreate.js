const guildSchema = require(`../../models/guild`),
    placeholders = require('../../site/functions/placeholders');

module.exports.run = async (bot, message) => {
    // proteger DMs
    const guildId = message.guild?.id;
    let guild = guildId ? await guildSchema.findOne({ id: guildId }) : null;
    guild = guild || {};
    let prefix = guild.prefix || `-`;

    if(message.content === `<@!${bot.user.id}>` || message.content === `<@${bot.user.id}>`) {
        return message.reply({ content: `Meu prefixo neste servidor é \`${prefix}\`` });
    }
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const channels = Array.isArray(guild.restricted?.channels) ? guild.restricted.channels : [];
    let restrictedMsg = typeof guild.restricted?.message === 'string' ? guild.restricted.message : '';

    if (restrictedMsg) {
        restrictedMsg = await placeholders.message(restrictedMsg, message);
    }

    if (channels.includes(message.channel?.id)) {
        // reply normal (sem ephemeral)
        return message.reply({ content: restrictedMsg || 'Você não pode usar comandos nesse canal.' });
    }

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    const cmd = bot.cmds.get(commandName);
    const aliasesCmd = bot.aliases.get(commandName);

    const command = cmd || aliasesCmd;

    if (!command) return;

    command.run(bot, message, args);
}