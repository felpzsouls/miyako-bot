require(`dotenv`).config();
const mongoose = require('mongoose');
mongoose.connect(process.env.mongoUrl,).then(() => console.log('database carregada'));

require(`./site/app`).port(80);
require(`./bot/index`).login(process.env.token);