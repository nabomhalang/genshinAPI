const redis = require("redis");
const { REDIS_PASSWORD } = require("../interfaces/config");

class RedisClient {
    constructor() {
        /** @type {redis.RedisClientType} */
        this.client = null;
        this.config = null;
    }

    /**
     * 
     * @param {Number} port
     * @param {String | Number} host
     * @param {import("express").NextFunction} callback 
     */
    async init(port, host, callback) {
        this.config = {
            socket: {
                port: port,
                host: host
            },
            password: REDIS_PASSWORD,
            legacyMode: true
        }

        this.client = redis.createClient(this.config);

        this.client.on("error", (error) => console.error(`Error : ${error}`));
        await this.client.connect().then();

        this.client = this.client.v4;

        if (callback) callback(this);
    }

    /**
     * 
     * @param {String} key 
     * @param {String} value 
     */
    set(key, value) {
        this.client.set(key, value);
        this.client.expire(key, 600);
    }

    /**
     * 
     * @param {String} key 
     */
    get(key) {
        return this.client.get(key);
    }
}

module.exports = RedisClient;