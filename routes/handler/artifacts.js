const yup = require("yup");

const { EnkaClient } = require("enka-network-api")

const schema = yup.object({
    uid: yup.number().required(),
    language: yup.string().max(64).default('en')
});

/** @type {import("express").RequestHandler} */
async function post(req, res, next) {
    const enka = new EnkaClient();
    
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
            const artifacts = char.artifacts

            artifacts.map(art => {
                console.log(art.artifactData.name.get(language));
                console.log(art.artifactData.setName.get(language));
                console.log(art.artifactData.equipType);
                // console.log(art.level);
                // console.log(art.mainstat);
                // console.log(art.substats);
            });
            console.log('==========');

            return res.status(200).json({
                c: 200,
                d: null
            });
        }


    });
}

module.exports = {
    path: "/artifacts",
    schema,
    post
}