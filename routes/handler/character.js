const yup = require("yup");
const crypto = require("crypto");

const { EnkaClient } = require("enka-network-api");

const schema = yup.object({
    uid: yup.number().required(),
    language: yup.string().max(64).default('en').required()
});

/** @type {import("express").RequestHandler} */
async function post(req, res) {
    /** @type {import("../controllers/redis")} */
    const redis = req.redis;

    const enka = new EnkaClient();
    const oChar = new Object();

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
        
        for (const char of characters) {
            const result = new Object();
            
            const name = char.characterData.name.get(language);
            
            const level = char.level;
            result[language === 'en' ? 'level' : '레벨'] = level;
            
            const element = char.characterData.element.name.get(language);
            result[language === 'en' ? 'element' : '속성'] = element;
            
            
            const constellations_ob = new Object();
            enka.getAllCharacters().map(v => {
                v.constellations.map((r, idx) => {
                    const result = new Object();
                    if (v.name.get(language) == name) {
                        result['name'] = r.icon.name;
                        result['description'] = r.description.get(language).replace(/\<[^\>]+\>/g, "").replace("\\n", " ");
                        result['url'] = r.icon.url;
                        result['isAvailable'] = false;
                        constellations_ob[idx] = result;
                    }
                });
            });
            
            char.unlockedConstellations.map((con, idx) => {
                constellations_ob[idx].isAvailable = true;
            });
            
            result[language === 'en' ? 'constellations' : '돌파'] = constellations_ob;

            const PassiveObject = new Object();
            char.unlockedPassiveTalents.map(v => {
                PassiveObject[v.name.get(language)] = {
                    "description" : v.description.get(language).replace(/\<[^\>]+\>/g, "").replace("\\n", " "), 
                    "name": v.icon.name, "url": v.icon.url, 
                    "isAvailable": v.icon.isAvailable,
                };
            });
            result[language === 'en' ? 'PassiveTalents' : '패시브'] = PassiveObject;
            
            const url = char.characterData.splashImage.url;
            result['url'] = url;

            char.status.statusProperties.map(stats => {
                let name = stats.type.get(language);
                const value = stats.value * (stats.isPercent ? 100 : 1)
                const fixed = stats.isPercent ? 1 : 0; 
                const suffix = stats.isPercent ? "%" : "";
                if(stats.isPercent)
                    name = `${name}%`

                result[name] = `${value.toFixed(fixed)}${suffix}`;
            });

            const skillList = new Object();
            char.skillLevels.map(skills => {
                skillList[skills.skill.name.get(language)] = {
                    "base": skills.level.base,
                    "extra": skills.level.extra,
                    "value": skills.level.value,
                    "url": skills.skill.icon.url,
                    "data": {
                        "abilityName": skills.skill._data.abilityName,
                        "skillIcon": skills.skill._data.skillIcon,
                        "cdTime": skills.skill._data.cdTime,
                        "costElemType": skills.skill._data.costElemType,
                        "costElemVal":  skills.skill._data.costElemVal,
                        "maxChargeNum":  skills.skill._data.maxChargeNum,
                        "lockShape":  skills.skill._data.lockShape,
                        "isAttackCameraLock":  skills.skill._data.isAttackCameraLock,
                        "buffIcon":  skills.skill._data.buffIcon,
                    }
                }
            });
            result[language === 'en' ? 'skills' : '스킬'] = skillList;
            oChar[name] = result;
        }

        const hUID = crypto.createHash('sha256').update(`${req.route.path}/${uid}`).digest('hex');
        redis.setValue(hUID, JSON.stringify(oChar));
        
        return res.status(200).json({
            c: 200,
            d: oChar
        });
    });
    
}

module.exports = {
    path: "/character",
    schema,
    post
}