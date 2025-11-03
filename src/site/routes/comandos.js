const { Router } = require('express');
const router = Router();
const bot = require('../../bot/index').bot;

function normalizeCommand(cmd) {
    if (!cmd) return { original: cmd, name: 'unknown', description: '', usage: '', aliases: [] };

    const data = (cmd.data && typeof cmd.data.toJSON === 'function') ? cmd.data.toJSON() : (cmd.data || {});
    const dataName = data.name;
    const dataDesc = data.description;

    const name = cmd.name || dataName || cmd.commandName || cmd.id || String(cmd.fileName || cmd._name || 'unknown');
    const description = cmd.description || dataDesc || '';
    let usage = cmd.usage || '';

    if (!usage && dataName) {
        const opts = Array.isArray(data.options) ? data.options : [];
        const parts = opts.map(o => (o.required ? `<${o.name}>` : `[${o.name}]`));
        usage = `/${dataName}${parts.length ? ' ' + parts.join(' ') : ''}`;
    } else if (!usage && cmd.name) {
        usage = `/${String(cmd.name)}`;
    }

    const aliases = Array.isArray(cmd.aliases) ? cmd.aliases : (cmd.aliases ? [cmd.aliases] : []);
    return { original: cmd, name, description, usage, aliases };
}

router.get('/', async (req, res) => {
    const raw = (() => {
        if (!bot || !bot.cmds) return [];
        if (Array.isArray(bot.cmds)) return bot.cmds;
        if (typeof bot.cmds.map === 'function') return bot.cmds.map(c => c);
        if (bot.cmds.values) return Array.from(bot.cmds.values());
        return [];
    })();

    const normalized = raw.map(normalizeCommand);
    

    const grouped = normalized.reduce((acc, cmd) => {
        const cat = (cmd && cmd.original && cmd.original.category) ? String(cmd.original.category) : 'Geral';
        acc[cat] = acc[cat] || [];
        acc[cat].push(cmd);
        return acc;
    }, {});

    const categories = Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map(cat => ({
            category: cat,
            commands: grouped[cat].sort((x, y) => String(x.name || '').localeCompare(String(y.name || ''), 'pt-BR'))
        }));

    res.render('comandos', {
        user: req.user,
        bot,
        categories
    });
});

module.exports = router;