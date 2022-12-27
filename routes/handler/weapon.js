const yup = require("yup");
const crypto = require("crypto");

const schema = yup.object({
    uid: yup.number().required(),
    language: yup.string().max(64).default('en')
});

/** @type {import("express").RequestHandler} */
async function post(req, res) {
    /** @type {import("../controllers/redis")} */
    const redis = req.redis;

    /** @type {import("../controllers/enka")} */
    const enka = req.enka;

    const { uid, language } = req.body;

    enka.client.fetchUser(uid).then(user => {
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
            const weapon_ob = new Object();
            const weapon = char.weapon.weaponData;

            const name = weapon.name.get(language);
            const weapon_typeName = weapon.weaponTypeName.get(language);
            const stars = weapon.stars;
            weapon_ob['name'] = name;
            weapon_ob['typeName'] = weapon_typeName;
            weapon_ob['stars'] = stars;

            const refinement = weapon.refinements[0];
            const refinementName = refinement ? refinement.name.get(language) : "No refinements";
            const refinementDesc = refinement ? refinement.description.get(language).replace(/\<[^\>]+\>/g, "").replace("\\n", " ") : "";
            const weapon_refinement = typeof char.weapon.refinement.level === 'undefined' ? 1 : char.weapon.refinement.level + 1
            weapon_ob['refinementName'] = refinementName
            weapon_ob['refinementDesc'] = refinementDesc
            weapon_ob['weapon_refinement'] = weapon_refinement

            const weapon_main = char.weapon._data;
            const weapon_level = weapon_main.weapon.level
            weapon_ob['weapon_level'] = weapon_level

            weapon_main.flat.weaponStats.map((_weapon, index) => {
                if (!index)
                    weapon_ob[`weapon_MainValue`] = { "appendPropId": _weapon.appendPropId, "statValue": _weapon.statValue };
                else
                    weapon_ob[`weapon_subValue`] = { "appendPropId": _weapon.appendPropId, "statValue": _weapon.statValue };
            });
            result[char.characterData.name.get(language)] = weapon_ob
        }


        const hUID = crypto.createHash('sha256').update(`${req.route.path}/${uid}`).digest('hex');
        redis.set(hUID, JSON.stringify(result));

        return res.status(200).json({
            c: 200,
            d: result
        });

    });
}

module.exports = {
    path: "/weapon",
    schema,
    post
}