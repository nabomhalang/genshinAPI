const express = require("express");
const path = require("path");
const fs = require("fs");

const MysqlConnector = require("./controllers/mysql");
const RedisConnector = require("./controllers/redis");
const EnkaConnectors = require("./controllers/enka");

const { validator, cache } = require("./guard");
const { DB_NAME, DB_PASSWORD, DB_TABLE_NAME, REDIS_PORT, REDIS_HOST } = require("./interfaces/config");

/**
 * 
 * @param {express.Express} app 
 */
async function prepare(app) {
    /** @type {import("./controllers/mysql")} */
    const mysql = new MysqlConnector();

    /** @type {import("./controllers/redis")} */
    const redis = new RedisConnector();

    /** @type {import("./controllers/enka")} */
    const enka = new EnkaConnectors();

    await new Promise((resolve, reject) => {
        mysql.init(DB_NAME, DB_PASSWORD, DB_TABLE_NAME, async () => {
            await mysql.query("SHOW TABLES LIKE \"UESR\"").then(async (r) => {
                if (!r || (r && !r.length)) {
                    await mysql.query("CREATE TABLE USER (UUID VARCHAR(64) PRIMARY KEY, userEmail VARCHAR(256), userID VARCHAR(64) UNIQUE, userPW VARCHAR(64), userName VARCHAR(32), userAvatar VARCHAR(512), userBD VARCHAR(32), userSEX INT, userVerified INT DEFAULT 0)").catch(e => reject(e));
                }
            }).catch(e => reject(e));
        });
        redis.init(REDIS_PORT, REDIS_HOST, () => console.log('Connection Success Redis'));
        enka.init(() => console.log(`Connection Success EnkaClient`));
        resolve(0);
    });

    app.disable("x-powered-by");
    app.use(express.json());

    app.use((req, res, next) => {
        req.mysql = mysql;
        req.redis = redis;
        req.enka = enka;

        res.setHeader("Access-Control-Allow-Origin", "*.nabomhalangkr.site");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
        res.setHeader("Access-Control-Allow-Methods", "*");

        if (req.method == "OPTIONS") return res.send(null);

        next();
    });

    fs.readdirSync(path.join(__dirname, "handler/")).forEach((handlerFile) => {
        const handler = require(`./handler/${handlerFile}`);

        if (handler?.schema)
            app.post(handler.path, (req, res, next) => validator(req, res, next, handler.schema),
                (req, res, next) => cache(req, res, next), handler.post);
        else if (handler?.post)
            app.post(handler.path, handler.post);
        else if (handler?.get)
            app.get(handler.path, handler.get);
    })


    app.use((req, res, next) => {
        return res.status(404).json({
            c: 404,
            d: "Not Found"
        });
    });

    app.use((err, req, res, next) => {
        console.log(`err: ${err}`);
        if (!res.headerSent) {
            return res.status(500).json({
                c: 500,
                d: "Internal Server Error"
            });
        }
    });

    return mysql;
}

module.exports = {
    prepare
}