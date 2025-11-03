const express = require(`express`),
    app = express(),
    passport = require(`passport`);

for (let x of ['middlewares', 'router']) require(`./handlers/${x}`)(app);

module.exports = {
    port: (port) => app.listen(port, '0.0.0.0', () => console.log('site online'))
}