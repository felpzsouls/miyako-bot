const { Router } = require('express');
const route = Router();
const bot = require('../../bot/index').bot;

route.get('/', (req, res) => {
    res.redirect('https://discord.gg/hP2ZXzSvvP');
});

module.exports = route;
