const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`pong`),
    category: 'Utilitários',
    aliases: ['pong'],
    run: async(bot, int) => {

        // calcular o tempo de resposta com a API do discord e o tempo de resposta do bot com o usuario
        
        const embed = new EmbedBuilder()
            .setTitle('Pong! 🏓')
            .addFields(
                { name: 'Latência da API', value: `${bot.ws.ping}ms`, inline: true },
                { name: 'Latência do Bot', value: `${int.createdTimestamp - Date.now()}ms`, inline: true }
            )
            .setColor('Blue')
            .setTimestamp();

        await int.reply({ embeds: [embed] });
    }
}