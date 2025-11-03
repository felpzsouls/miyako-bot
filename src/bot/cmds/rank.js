const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userModel = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Veja o rank de Whiskers dos usuários!'),
    category: 'Economia',
    aliases: ['ranking', 'top', 'leaderboard'],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;
        const invokerId = isSlash ? interaction.user.id : interaction.author.id;

        // Buscar os top 10 usuários com mais Whiskers
        const topUsers = await userModel.find().sort({ whiskers: -1 }).limit(10);

        // Tentar buscar todos os Discord users em paralelo (usar cache/API)
        const fetches = topUsers.map(u => {
            const id = u.id || String(u._id || '');
            return bot.users.fetch(id).catch(() => null);
        });
        const fetched = await Promise.all(fetches);

        // Criar embed
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Ranking de Whiskers 🏆')
            .setDescription('Aqui estão os usuários com mais Whiskers:')
            .setTimestamp();

        // Montar campos com fallback quando não encontrar o user
        const medals = ['🥇', '🥈', '🥉'];
        const fields = topUsers.map((u, i) => {
            const discordUser = fetched[i];
            const id = u.id || String(u._id || 'unknown');
            const name = discordUser ? `${discordUser.tag}` : (u.tag ? u.tag : `ID ${id}`);
            const positionLabel = i < 3 ? `${medals[i]} ${name}` : `#${i + 1} - ${name}`;
            return {
                name: positionLabel,
                value: `${u.whiskers ?? 0} Whiskers`,
                inline: false
            };
        });

        if (fields.length === 0) {
            embed.setDescription('Nenhum usuário com Whiskers encontrado.');
        } else {
            embed.addFields(fields);
        }

        // Enviar
        if (isSlash) {
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.channel.send({ embeds: [embed] });
        }
    }
};