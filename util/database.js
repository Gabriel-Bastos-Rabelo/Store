const Sequelize = require('sequelize');

const sequelize = new Sequelize('store_project', 'root', 'Gb@stos7', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;