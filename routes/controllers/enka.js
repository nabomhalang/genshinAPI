const redis = require("redis");
const { EnkaClient } = require("enka-network-api");

class RedisClient {
    constructor() {
        /** @type {EnkaClient} */
        this.client = null;
        this.config = null;
    }

    /**
     * 
     * @param {import("express").NextFunction} callback 
     */
    init(callback) {
        this.config = {
            showFetchCacheLog: true
        };

        this.client = new EnkaClient(this.config);

        if (callback) callback(this);
    }

    /**
     * @param {import("express").NextFunction} callback
     */
    update(callback) {
        // this.client.cachedAssetsManager.activateAutoCacheUpdater({
        //     instant: true,
        //     timeout: 60 * 60 * 1000,
        //     onUpdateStart: async () => {
        //         console.log("Updating Genshin Data...");
        //     },
        //     onUpdateEnd: async () => {
        //         enka.cachedAssetsManager.refreshAllData();
        //         console.log("Updating Completed!");
        //     }
        // });

        this.client.cachedAssetsManager.fetchAllContents();

        // this.enkaClient.cachedAssetsManager.deactivateAutoCacheUpdater();

        if (callback) callback(this);
    }
}

module.exports = RedisClient;