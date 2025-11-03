const data = require('../../models/guild'),
    placeholders = require('../../site/functions/placeholders');

function normalizeColor(col) {
    if (typeof col === 'string' && col.startsWith('#')) {
        return parseInt(col.replace('#',''), 16);
    }
    if (typeof col === 'string' && /^\d+$/.test(col)) {
        return parseInt(col, 10);
    }
    return col;
}

function normalizeEmbed(embed) {
    if (!embed || typeof embed !== 'object') return embed;
    const e = { ...embed };
    if (e.color) e.color = normalizeColor(e.color);
    if (e.image && typeof e.image === 'object' && e.image.url) e.image.url = e.image.url;
    if (e.thumbnail && typeof e.thumbnail === 'object' && e.thumbnail.url) e.thumbnail.url = e.thumbnail.url;
    if (Array.isArray(e.fields)) e.fields = e.fields.map(f => ({ name: String(f.name || ''), value: String(f.value || ''), inline: !!f.inline }));

    // Normalize timestamp: aceitar número (ms), string numérica ou Date e converter para ISO8601
    if (e.timestamp) {
        // números ou strings numéricas (ex: "1761326310697") -> tratar como ms desde epoch
        if (typeof e.timestamp === 'number' || (/^\d+$/.test(String(e.timestamp)) && !isNaN(Number(e.timestamp)))) {
            const d = new Date(Number(e.timestamp));
            if (!isNaN(d.getTime())) e.timestamp = d.toISOString();
            else delete e.timestamp;
        } else if (e.timestamp instanceof Date) {
            e.timestamp = e.timestamp.toISOString();
        } else if (typeof e.timestamp === 'string') {
            // se for string não-numérica, presume-se que já é ISO; valida simples
            const date = new Date(e.timestamp);
            if (isNaN(date.getTime())) delete e.timestamp; // remove se inválido
            else e.timestamp = date.toISOString();
        }
    }

    return e;
}

module.exports.run = async (bot, member) => {
    const guildData = await data.findOne({ id: member.guild.id }) || {};

    // Envio da mensagem de boas-vindas
    let channelId = guildData.welcome?.channel || null;
    if (Array.isArray(channelId)) channelId = channelId[0] || null;

    const raw = guildData.welcome?.message ?? '';
    if (!raw) return;

    let processed;
    try {
        // placeholders.message aceita string JSON, string normal ou objeto
        processed = await placeholders.message(raw, member);
    } catch (err) {
        console.error('Error processing placeholders for welcome message:', err);
        processed = typeof raw === 'string' ? raw : '';
    }

    // Se processed for uma string que contém JSON (payload salvo como string), tenta parsear
    let payload = processed;
    if (typeof processed === 'string') {
        const trimmed = processed.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                payload = JSON.parse(processed);
            } catch (e) {
                // não é JSON válido -> mantém string
                payload = processed;
            }
        }
    }

    // se payload.embeds for string (ex: veio como JSON mas com embeds em string), tenta parsear também
    if (payload && payload.embeds && typeof payload.embeds === 'string') {
        try {
            const parsedEmbeds = JSON.parse(payload.embeds);
            if (Array.isArray(parsedEmbeds)) payload.embeds = parsedEmbeds;
        } catch (e) {
            // ignora
        }
    }

    if (!channelId) return;

    try {
        let channel = bot.channels.cache.get(channelId) || await bot.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            console.warn(`Canal não encontrado para ID ${channelId}`);
            return;
        }
        if (typeof channel.send !== 'function') {
            console.warn(`Canal ${channelId} não suporta envio de mensagens (tipo: ${channel.type ?? 'unknown'})`);
            return;
        }

        // Se payload é objeto/array que representa embed(s), enviar como embed
        if (payload && typeof payload === 'object') {
            if (Array.isArray(payload)) {
                const embeds = payload.map(normalizeEmbed);
                await channel.send({ embeds });
            } else if (payload.embeds && Array.isArray(payload.embeds)) {
                const embeds = payload.embeds.map(normalizeEmbed);
                await channel.send({ embeds });
            } else {
                const possibleEmbed = normalizeEmbed(payload);
                const isEmbedLike = possibleEmbed && (possibleEmbed.title || possibleEmbed.description || possibleEmbed.fields || possibleEmbed.thumbnail || possibleEmbed.image || possibleEmbed.footer);
                if (isEmbedLike) {
                    await channel.send({ embeds: [possibleEmbed] });
                } else {
                    // fallback: mostrar stringificada para debug
                    await channel.send({ content: JSON.stringify(payload) });
                }
            }
            
        } else {
            // texto simples
            const text = typeof payload === 'string' ? payload : (payload?.toString() || 'Bem-vindo ao servidor!');
            await channel.send({ content: text });
        }
    } catch (err) {
        console.error(`Falha ao enviar welcome para ${channelId}:`, err);
    }

    // Adição do cargo automático
    if (guildData.autorole?.active && guildData.autorole?.roleId) {
        const roleId = guildData.autorole.roleId;
        const role = member.guild.roles.cache.get(roleId) || await member.guild.roles.fetch(roleId).catch(() => null);
        if (role) {
            try {
                await member.roles.add(role, 'Cargo automático de boas-vindas');
            } catch (err) {
                console.error(`Erro ao adicionar cargo automático (${roleId}) ao membro ${member.id} na guilda ${member.guild.id}:`, err);
            }
        }
    }
}