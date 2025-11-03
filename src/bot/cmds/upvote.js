const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upvote')
        .setDescription('Vote em mim!'),
    category: 'informações',
    aliases: [ 'vote', 'votar'],
    run: async (bot, interaction) => {
        const upvoteLink = `https://top.gg/bot/${bot.user.id}/vote`;
        const embed = new EmbedBuilder()
            .setTitle('Vote em mim!')
            .setThumbnail(bot.user.displayAvatarURL())
            .setDescription(`[Clique aqui para votar em mim!](${upvoteLink})\n\nSeu voto me ajuda a crescer e alcançar mais pessoas! Muito obrigado pelo seu apoio! 🙏`)
            .setColor('#00AAFF');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};