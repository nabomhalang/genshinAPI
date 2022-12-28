const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { SECRET } = require("../interfaces/config");

const secret = SECRET;

/**
 * 
 * @param {string} data 
 */
function create(data) {
    return new Promise((resolve, reject) => {
        jwt.sign({
            data: encrypt(data)
        }, secret, {
            expiresIn: "30m"
        }, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
}

/**
 * 
 * @param {string} key 
 */
function verify(key) {
    try {
        const verified = jwt.verify(key, secret);
        console.log(verified);

        return true;
    } catch (_) { }

    return false;
}

/**
 * 
 * @param {string} data 
 */
function decode(data) {
    try {
        return decrypt(jwt.verify(data, secret).data);
    } catch (_) { }

    return null;
}

/**
 * 
 * @param {String | Buffer} data 
 * @returns {String}
 */
function encrypt(data) {
    const cipher = crypto.createCipheriv("aes-256-gcm", secret.substring(0, 32), Buffer.alloc(8, 0));
    return cipher.update(data, null, "base64") + cipher.final("base64") + cipher.getAuthTag().toString("hex");
}

/**
 * 
 * @param {String} data 
 * @returns {String}
 */
function decrypt(data) {
    const cipher = crypto.createDecipheriv("aes-256-gcm", secret.substring(0, 32), Buffer.alloc(8, 0));
    cipher.setAuthTag(Buffer.from(data.substring(data.length - 32), "hex"))
    return cipher.update(data.substring(0, data.length - 32), "base64", "utf-8") + cipher.final("utf-8");
}

/**
 * 
 * @param {Number} size
 */
function createRandom(size) {
    return [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
}

module.exports = {
    create,
    decode,
    encrypt,
    decrypt,
    verify,
    createRandom
}