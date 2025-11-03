const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const user = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informações sobre um usuário.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuário').setRequired(false)),
    category: 'Informações',
    aliases: ['user'],
    run: async (bot, interaction, args) => {
        const isSlash = !!interaction.options;
        const invokerId = isSlash ? interaction.user : interaction.author;

        let targetId = invokerId.id;
        let targetUser = null;
        let targetMember = null;

        if (isSlash) {
            targetUser = interaction.options.getUser('usuario') || null;
            if (targetUser) targetId = targetUser.id;
            if (interaction.guild && targetId) {
                targetMember = interaction.guild.members.cache.get(targetId) || null;
                if (!targetMember) {
                    try { targetMember = await interaction.guild.members.fetch(targetId); } catch { }
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
                    try { targetMember = await interaction.guild.members.fetch(targetId); } catch { }
                }
                if (targetMember) targetUser = targetMember.user;
            }
            if (!targetUser && targetId) {
                try { targetUser = await bot.users.fetch(targetId); } catch { }
            }
        }

        const member = interaction.guild.members.cache.get(targetUser.id);

        const userEmbed = new EmbedBuilder()
            .setTitle(`Informações de usuário: ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: targetUser.id, inline: true },
                { name: 'Tag ', value: '@' + targetUser.tag, inline: true },
                { name: 'Criado em', value: new Date(targetUser.createdTimestamp).toLocaleDateString('pt-BR'), inline: true }
            )
            .setColor('Random')
            .setTimestamp();
        if (isSlash) {
            userEmbed.setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        } else {
            userEmbed.setFooter({ text: `Solicitado por ${interaction.author.tag}`, iconURL: interaction.author.displayAvatarURL({ dynamic: true }) })
        }


        if (member) {
            const memberEmbed = new EmbedBuilder()
                .setTitle(`Informações de membro: ${targetUser.tag}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Apelido', value: targetMember.nickname ? targetMember.nickname : 'Nenhum', inline: true },
                    { name: 'Entrou em', value: new Date(targetMember.joinedTimestamp).toLocaleDateString('pt-BR'), inline: true },
                    { name: 'Maior cargo:', value: targetMember.roles.highest ? `<@&${targetMember.roles.highest.id}>` : 'Nenhum', inline: false }
                )
                .setColor('Random')
                .setFooter({ text: `clique em 🔰 para ver as permissões do membro` })
                .setTimestamp();

            await interaction.reply({ embeds: [userEmbed, memberEmbed] }).then(msg => {
                msg.react('🔰').catch(() => { });

                const filter = (rec, user) => {
                    return rec.emoji.name === '🔰' && user.id === invokerId.id;
                }

                const collector = msg.createReactionCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', async (reaction, user) => {
                    let embedPerms = new EmbedBuilder()
                        .setTitle(`Permissões de ${targetUser.tag}`)
                        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                        .setColor('Random')
                        .setTimestamp();
                    const perms = [];
                    targetMember.permissions.toArray().forEach(perm => {
                        perms.push(`• ${perm}`);
                    });
                    embedPerms.setDescription(perms.join('\n') || 'Nenhuma permissão encontrada.');
                    await interaction.channel.send({ embeds: [embedPerms] });
                });
                return;
            });
        } else {
        await interaction.reply({ embeds: [userEmbed] });
        }
    }
};