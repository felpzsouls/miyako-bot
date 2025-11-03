const { Router } = require(`express`),
    route = Router(),
    bot = require(`../../bot`).bot,
    guildSchema = require(`../../models/guild`), 
    functions = require(`../functions/functions`);

route.get(`/`, (req, res) => res.redirect(`/dashboard`));

route.get(`/:id`, async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/dashboard`);

    const user = req.user,
        guild = bot.guilds.cache.get(req.params.id),
        guildData = await guildSchema.findOne({ id: guild.id }),
        channels = await guild.channels.fetch(),
        textChannels = [...channels.values()].filter(channel => channel.type === 0);

    if (!guild) return res.redirect(`/dashboard`);
    if(!guildData) {
        await functions.getGuildData(guild.id);
        return res.redirect(`/guilds/${guild.id}`);
    };
    
    res.render(`guilds`, {
        user,
        bot,
        guild,
        guildData,
        guildChannels: textChannels
    })
})

route.get(`/:id`, async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/dashboard`);

    const user = req.user,
        guild = bot.guilds.cache.get(req.params.id),
        guildData = await guildSchema.findOne({ id: guild.id }),
        channels = await guild.channels.fetch(),
        textChannels = [...channels.values()].filter(channel => channel.type === 0);

    if (!guild) return res.redirect(`/dashboard`);
    if(!guildData) {
        await functions.getGuildData(guild.id);
        return res.redirect(`/guilds/${guild.id}`);
    };
    
    res.render(`guilds`, {
        user,
        bot,
        guild,
        guildData,
        guildChannels: textChannels
    })
})

route.get(`/:id/welcomer`, async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/dashboard`);
    
    const user = req.user,
        guild = bot.guilds.cache.get(req.params.id),
        guildData = await guildSchema.findOne({ id: guild.id }),
        channels = await guild.channels.fetch(),
        textChannels = [...channels.values()].filter(channel => channel.type === 0);
        
    if (!guild) return res.redirect(`/dashboard`);
    if(!guildData) {
        await functions.getGuildData(guild.id);
        return res.redirect(`/guilds/${guild.id}/welcomer`);
    }

    res.render(`welcomer`, {
        user,
        bot,
        guild,
        guildData,
        guildChannels: textChannels
    })
})

route.get(`/:id/autorole`, async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect(`/dashboard`);
    
    const user = req.user,
        guild = bot.guilds.cache.get(req.params.id),
        guildData = await guildSchema.findOne({ id: guild.id }),
        channels = await guild.channels.fetch(),
        roles = await guild.roles.fetch(),
        guildRoles = [...roles.values()].filter(role => role.id !== guild.id && role.editable);

    if (!guild) return res.redirect(`/dashboard`);

    if(!guildData) {
        await functions.getGuildData(guild.id);
        return res.redirect(`/guilds/${guild.id}/autorole`);
    }

    res.render(`autorole`, {
        user,
        bot,
        guild,
        guildData,
        guildRoles
    })
})

route.get(`/callback`, async (req, res) => {
    const guildId = req.query.state;

    res.redirect(`/guilds/${guildId}`);
})

module.exports = route