const crypto = require("crypto");

/** @type {import("express").Handler} */
function validator(req, res, next, schema) {
    schema.validate(req.body).then(v => {
        req.body = v;
        next();
    }, _ => {
        return res.status(400).json({
            c: 400,
            d: "Bad Request"
        });
    });
}

/** @type {import("express").Handler} */
function cache(req, res, next) {
    /** @type {import("../controllers/redis")} */
    const redis = req.redis;

    const hUID = crypto.createHash('sha256').update(`${req.route.path}/${req.body.uid}`).digest('hex');
    
    (async() => {
        await redis.getValue(hUID).then(async(data) => {
            if(data) {
                return res.status(200).json({
                    c: 200,
                    d: JSON.parse(data)
                });
            } else next();
        });
    })();
}

module.exports = {
    validator,
    cache
}