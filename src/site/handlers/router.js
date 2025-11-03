const { readdirSync } = require(`fs`);

module.exports = async (app) => {
    const path = readdirSync('./src/site/routes/').filter(x => x.endsWith('.js'));

    for (let file of path) {
        const route = require(`../routes/${file}`),
            routePath = file === 'index.js' ? '/' : `/${file.slice(0, -3)}`;

        try {
            app.use(routePath, route)
        } catch (err) {
            console.log(err)
        };
    };
};