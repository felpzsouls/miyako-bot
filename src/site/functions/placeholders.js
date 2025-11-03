const { bot } = require('../../index')

module.exports = {
    message: async (template, ctx) => {
        // garante que template é string
        if (typeof template !== 'string') return template;

        // ctx pode ser Interaction (ctx.user) ou Message (ctx.author)
        const user = ctx?.user ?? ctx?.author ?? null;
        const member = ctx?.member ?? null;
        const guild = ctx?.guild ?? null;

        const userAvatarUrl = user
            ? (typeof user.displayAvatarURL === 'function'
                ? user.displayAvatarURL({ dynamic: true, size: 1024 })
                : (typeof user.avatarURL === 'function' ? user.avatarURL({ dynamic: true, size: 1024 }) : ''))
            : '';

        const guildIconUrl = guild
            ? (typeof guild.iconURL === 'function' ? guild.iconURL({ dynamic: true, size: 1024 }) : '')
            : '';
        const nickname = member?.nickname ?? member?.displayName ?? user?.username ?? '';

        // executar todas as substituições e reatribuir (seguro quando user for null)
        let message = template;
        if (user) {
            message = message.replace(/{@user}/g, `<@${user.id}>`);
            message = message.replace(/{user.id}/g, `${user.id}`);
            message = message.replace(/{user.avatar}/g, userAvatarUrl);
            message = message.replace(/{user.nickname}/g, nickname);
            message = message.replace(/{user}/g, `${user.username}`);
            message = message.replace(/{guild}/g, `${guild.name}`);
            message = message.replace(/{guild.id}/g, `${guild.id}`);
            message = message.replace(/{guild.size}/g, `${guild.memberCount}`);
            message = message.replace(/{guild.icon}/g, guildIconUrl);
        } else {
            // se não houver user, remove/neutraliza placeholders conhecidos
            message = message.replace(/{@user}/g, '@user');
            message = message.replace(/{user.id}/g, '');
            message = message.replace(/{user.avatar}/g, '');
            message = message.replace(/{user.nickname}/g, '');
            message = message.replace(/{user}/g, 'usuario');
            message = message.replace(/{guild}/g, guild ? `${guild.name}` : 'servidor');
            message = message.replace(/{guild.id}/g, guild ? `${guild.id}` : '');
            message = message.replace(/{guild.size}/g, guild ? `${guild.memberCount}` : '');
            message = message.replace(/{guild.icon}/g, '');
        }

        return message;
    }
}