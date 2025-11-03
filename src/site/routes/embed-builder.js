const { Router } = require('express'),
    route = Router(),
    bot = require(`../../bot`).bot,
    functions = require(`../functions/functions`);

route.get(`/`, (req, res) => {


    res.render(`embed-builder`, {
        bot,
        user: req.isAuthenticated() ? req.user : null
    });
});

module.exports = route;