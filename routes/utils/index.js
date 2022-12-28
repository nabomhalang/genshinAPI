const { create, decode, encrypt, decrypt, verify, createRandom } = require("./auth");
const { filterTagFromUserData, getCharacters, makeObject } = require("./genshin");

module.exports = {
    create,
    decode,
    encrypt,
    decrypt,
    verify,
    filterTagFromUserData,
    getCharacters,
    makeObject,
    createRandom
}