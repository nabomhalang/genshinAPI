const { EnkaClient } = require("enka-network-api");

/** @type {import("express").RequestHandler} */
function getCharacters() {
    const enka = new EnkaClient();
    const characters = enka.getAllCharacters();

    return characters;
}

/**
 * 
 * @param {Object} userData 
 */
function filterTagFromUserData(userData) {
    const result = new Array();
    for (let key in userData) {
        result.push(key, userData[key]);
    }
    // console.log(result);
    return result;
}

/**
 * 
 * @param {string} name
 * @param {Object | String} data 
 * @returns {Object}
 */
function makeObject(name, data) {
    const object = new Object();
    object[name] = data;
    return object
}



module.exports = {
    getCharacters,
    filterTagFromUserData,
    makeObject
}