const { Router } = require('express');
const route = Router();
const bot = require('../../bot/index').bot;
const guildSchema = require('../../models/guild')

route.get('/', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/auth/discord');

  const user = req.user;
  const userGuilds = user.guilds.filter(guild => guild.owner || (guild.permissions & 0x00000020));

  const serverCheck = userGuilds.map(async (guild) => {
    await bot.guilds.fetch(guild.id).catch(() => false);
    const inServer = bot.guilds.cache.has(guild.id),
      redirectUri = encodeURIComponent(`http://localhost/guilds/callback`);

    let link = inServer ? `/guilds/${guild.id}` : `https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot+applications.commands&permissions=8&guild_id=${guild.id}&response_type=code&redirect_uri=${redirectUri}&state=${guild.id}`,
      text = inServer ? "Configurações" : "Me adicione";

    return `<div class="col-8 col-md-4">
      <div class="d-flex align-items-center">
        <img src="${guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? "gif" : "png"}` : 'https://loritta.website/assets/img/unknown.png'}" class="img-thumbnail rounded-circle border border-info border-2 bg-dark" width="55" height="55"/>
        <h3 class="text-center ml-2 text-truncate-custom">${guild.name}</h3>
      </div>
      <a class="btn btn-outline-info mt-2" role="button" href="${link}">${text}</a>
    </div>`;
  });

  const servers = await Promise.all(serverCheck);

  res.render('dashboard', {
    user,
    bot,
    servers: servers.join("")
  });
});

module.exports = route;