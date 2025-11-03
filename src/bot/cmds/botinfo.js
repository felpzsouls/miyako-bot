const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Mostra informações sobre o bot'),
    category: 'Utilitários',
    aliases: ['bot', 'info'],
    run: async (bot, int) => {

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Miyako', iconURL: bot.user.displayAvatarURL() })
            .setURL('https://miyakobot.dedyn.io')
            .setThumbnail(bot.user.displayAvatarURL())
            .setTitle('Informações do Bot 🤖')
            .setColor('Purple')
            .setDescription('Olá eu me chamo Miyako! Sou um bot focado em ajudar servidores Discord e trazer um pouco de felicidade para os usuarios do Discord. Aqui estão algumas informações sobre mim:')
            .addFields(
                { name: 'Meu Criador', value: `[${bot.users.cache.get('1191815547491467414').tag}](https://twitch.tv/felpzsouls)`, inline: true },
                { name: 'Servidores', value: `${bot.guilds.cache.size}`, inline: true },
                { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: 'Usuários', value: `${bot.users.cache.size}`, inline: true },
                { name: 'Comandos', value: `${bot.cmds.size}`, inline: true },
                { name: 'Meu website', value: `https://miyakobot.dedyn.io`, inline: true },
            )
            .setTimestamp();
        await int.reply({ embeds: [embed] });
    }
};