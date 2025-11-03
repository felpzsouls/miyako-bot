const { SlashCommandBuilder } = require('discord.js');
const userModel = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Resgatar sua recompensa diária de Whiskers!'),
    category: 'Economia',
    aliases: ['diario', 'recompensa'],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;
        const userId = isSlash ? interaction.user.id : interaction.author.id;

        // Faz a entrega do daily sempre liberando a partir de meia noite do proximo dia
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let userData = await userModel.findOne({ id: userId });
        
        if (!userData) {
            userData = new userModel({ id: userId, whiskers: 0, lastDaily: null });
        }
        
        const lastDaily = userData.lastDaily ? new Date(userData.lastDaily) : null;

        if (lastDaily && lastDaily >= todayMidnight) {
            // calcular próxima meia-noite (início do próximo dia), não lastDaily + 24h
            const nextMidnight = new Date(todayMidnight);
            nextMidnight.setDate(nextMidnight.getDate() + 1);

            const timeRemaining = nextMidnight - now;
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            const replyMessage = `⏳ | Você já resgatou sua recompensa diária hoje! Volte em ${hours}h ${minutes}m ${seconds}s.`;
            if (isSlash) {
                await interaction.reply(replyMessage);
            } else {
                await interaction.channel.send(replyMessage);
            }
            return;
        }

        // Concede a recompensa diária
        const dailyAmount = Math.floor(Math.random() * 1000);
        userData.whiskers += dailyAmount;
        userData.lastDaily = now;
        await userData.save();

        // futuramente adicionar essa funcao ao site de perfil do usuario
        
        const replyMessage = `🎉 | Você resgatou sua recompensa diária de **${dailyAmount} Whiskers**!`;
        if (isSlash) {
            await interaction.reply(replyMessage);
        } else {
            await interaction.channel.send(replyMessage);
        }
    }
};