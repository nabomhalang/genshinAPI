require("dotenv").config();

const environment = {
    SECRET: process.env.SECRET,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_TABLE_NAME: process.env.DB_TABLE_NAME,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
}

module.exports = environment;