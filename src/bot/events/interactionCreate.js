const data = require('../../models/guild'),
    placeholders = require('../../site/functions/placeholders');

module.exports.run = async (bot, int) => {
    let guild = await data.findOne({ id: int.guild.id });

    if (!int.isChatInputCommand()) return;

    const { commandName } = int,
        command = int.client.cmds.get(commandName)

    if(!command) return;

    const channels = Array.isArray(guild.restricted?.channels) ? guild.restricted.channels : [];
    let msg = typeof guild.restricted?.message === 'string' ? guild.restricted.message : '';

    if (msg) {
        msg = await placeholders.message(msg, int);
    }

    if (channels.includes(int.channel?.id)) {
        return int.reply({ content: msg || 'Você não pode usar comandos nesse canal.', ephemeral: true });
    }
    
    command.run(bot, int)
};