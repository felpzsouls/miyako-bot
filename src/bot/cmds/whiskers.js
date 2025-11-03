const { SlashCommandBuilder } = require('discord.js');
const userModel = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whiskers')
        .setDescription('Ver seu saldo de Whiskers ou de um usuário!')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário que você quer ver o saldo')),
    category: 'Economia',
    usage: '[usuario]',
    aliases: ['balance', 'saldo', 'atm', 'bal'],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;
        const invokerId = isSlash ? interaction.user.id : interaction.author.id;

        // resolve target id + user/member
        let targetId = invokerId;
        let targetUser = null;
        let targetMember = null;

        if (isSlash) {
            targetUser = interaction.options.getUser('usuario') || null;
            if (targetUser) targetId = targetUser.id;
            if (interaction.guild && targetId) {
                targetMember = interaction.guild.members.cache.get(targetId) || null;
                if (!targetMember) {
                    try { targetMember = await interaction.guild.members.fetch(targetId); } catch {}
                }
            }
        } else {
            if (args && args[0]) {
                const mention = args[0];
                const matches = mention.match(/^<@!?(\d+)>$/);
                targetId = matches ? matches[1] : mention;
            }
            if (interaction.guild && targetId) {
                targetMember = interaction.guild.members.cache.get(targetId) || null;
                if (!targetMember) {
                    try { targetMember = await interaction.guild.members.fetch(targetId); } catch {}
                }
                if (targetMember) targetUser = targetMember.user;
            }
            if (!targetUser && targetId) {
                try { targetUser = await bot.users.fetch(targetId); } catch {}
            }
        }

        // evita ver saldo de bots
        if (targetUser && targetUser.bot) {
            const replyMessage = `🤖 | Bots não possuem saldo de Whiskers.`;
            if (isSlash) return interaction.reply({ content: replyMessage, ephemeral: true });
            return interaction.channel.send(replyMessage);
        }

        // busca/garante dados do usuário alvo
        let userData = await userModel.findOne({ id: targetId });
        if (!userData) {
            userData = new userModel({ id: targetId, whiskers: 0 });
            await userData.save();
        }

        // garante número em balance antes de calcular posição
        const balance = Number(userData.whiskers || 0);

        // calcula posição: quantos têm mais whiskers + 1
        const greaterCount = await userModel.countDocuments({ whiskers: { $gt: balance } });
        const position = greaterCount + 1;

        // responde com o saldo e posição
        if (targetId === invokerId) {
            const replyMessage = `💰 | Você tem **${balance} Whiskers**. Você está em **#${position} Lugar** no ranking.`;
            if (isSlash) return interaction.reply({ content: replyMessage, ephemeral: true });
            return interaction.channel.send(replyMessage);
        } else {
            const mentionText = targetUser ? `<@${targetId}>` : `ID ${targetId}`;
            const replyMessage = `💰 | ${mentionText} tem **${balance} Whiskers**. Ele está em **#${position} Lugar** no ranking.`;
            if (isSlash) return interaction.reply({ content: replyMessage, ephemeral: true });
            return interaction.channel.send(replyMessage);
        }
    }
};