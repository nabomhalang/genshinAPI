const yup = require("yup");
const crypto = require("crypto");

const { EnkaClient } = require("enka-network-api")

const schema = yup.object({
    uid: yup.number().required(),
    language: yup.string().max(64).default('en')
});

/** @type {import("express").RequestHandler} */
async function post(req, res, next) {
    /** @type {import("../controllers/redis")} */
    const redis = req.redis;

    const enka = new EnkaClient();
    const result = new Object();

    const { uid, language } = req.body;

    enka.fetchUser(uid).then(user => {
        const characters = user.characters;

        if (characters.length === 0) {
            return res.status(400).json({
                c: 400,
                d: "Bad Request",
                m: "찾을 수 없는 UID입니다."
            });
        }
        const result = new Object();
        for (const char of characters) {
            const artifacts_ob = new Object();
            const artifacts = char.artifacts;

            artifacts.map((art, idx) => {
                const result = new Object();
                result['name'] = art.artifactData.name.get(language);
                result['start'] = art.artifactData.stars;
                result['level'] = art.level - 1;
                result['url'] = art.artifactData.icon.url;

                const mainState = new Object();
                mainState['stateType'] = art.mainstat.type.get(language);
                mainState['statValue'] = art.mainstat.statValue;

                const subState = new Object();
                art.substats.total.map((v, idx) => {
                    const result = new Object();
                    result['stateType'] = v._data.appendPropId;
                    result['stateValue'] = v._data.statValue;
                    subState[idx] = result;
                });

                result['mainState'] = mainState;
                result['subState'] = subState;

                result['setName'] = art.artifactData.setName.get(language);
                result['Description'] = art.artifactData.description.get(language).replace(/\<[^\>]+\>/g, "").replace("\\n", " ");

                artifacts_ob[art.artifactData.equipType] = result;

            });

            result[char.characterData.name.get(language)] = artifacts_ob;
        }

        const hUID = crypto.createHash("sha256").update(`${req.route.path}/${uid}`).digest("hex");
        redis.set(hUID, JSON.stringify(result));

        return res.status(200).json({
            c: 200,
            d: result
        });
    });
}

module.exports = {
    path: "/artifacts",
    schema,
    post
}