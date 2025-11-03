const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('expulsa um membro do servidor')
        .addUserOption(option =>
            option.setName('membro')
                .setDescription('membro a ser expulso')
                .setRequired(true)
        ),
    category: 'Moderação',
    usage: '<membro>',
    aliases: ['expulsar'],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;
        // normaliza executor e função de reply para Slash vs Message
        const executorUser = isSlash ? interaction.user : interaction.author;
        const executorMember = isSlash ? interaction.member : interaction.member;
        const reply = async (payload) => {
            try {
                if (isSlash) return interaction.reply(payload);
                // em mensagem, prefira message.reply se existir
                if (typeof payload === 'object') {
                    const text = payload.content ?? JSON.stringify(payload);
                    return interaction.reply ? interaction.reply(text) : interaction.channel.send(text);
                } else {
                    return interaction.reply ? interaction.reply(payload) : interaction.channel.send(payload);
                }
            } catch (e) {
                // fallback
                if (!isSlash) interaction.channel.send(typeof payload === 'string' ? payload : (payload.content ?? '')).catch(() => null);
            }
        };

        // resolve usuário alvo
        let user = isSlash ? interaction.options.getUser('membro') : (args && args[0]);
        if (!isSlash && args && args[0]) {
            // tenta resolver menção ou ID
            const mention = args[0];
            const matches = mention.match(/^<@!?(\d+)>$/);
            if (matches) {
                const userId = matches[1];
                user = interaction.guild.members.cache.get(userId)?.user;
            } else {
                user = interaction.guild.members.cache.get(mention)?.user;
                if (!user) {
                    return await reply({ content: `❌ | Membro \`${mention}\` não encontrado.`, ephemeral: true });
                }
            }
        }
        if (!user) {
            return await reply({ content: '❌ | Por favor, especifique um membro válido para expulsar.', ephemeral: true });
        }
        const memberToKick = interaction.guild.members.cache.get(user.id);
        if (!memberToKick) {
            return await reply({ content: `❌ | Membro \`${user.tag}\` não encontrado no servidor.`, ephemeral: true });
        }
        // verifica se o executor tem permissão para expulsar
        if (!executorMember.permissions.has('KICK_MEMBERS')) {
            return await reply({ content: '❌ | Você não tem permissão para expulsar membros neste servidor.', ephemeral: true });
        }
        // verifica se o bot tem permissão para expulsar
        const botMember = interaction.guild.members.cache.get(bot.user.id);
        if (!botMember.permissions.has('KICK_MEMBERS')) {
            return await reply({ content: '❌ | Eu não tenho permissão para expulsar membros neste servidor.', ephemeral: true });
        }
        // tenta expulsar o membro
        try {
            await memberToKick.kick(`Expulso por ${executorUser.tag}`);
            return await reply({ content: `✅ | Membro \`${user.tag}\` expulso com sucesso.` });
        } catch (error) {
            console.error('Erro ao expulsar membro:', error);
            return await reply({ content: `❌ | Não foi possível expulsar o membro \`${user.tag}\`. Verifique minhas permissões e tente novamente.`, ephemeral: true });
        }
    }
};