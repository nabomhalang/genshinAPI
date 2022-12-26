const yup = require("yup");
const crypto = require("crypto");

const schema = yup.object({
    email: yup.string().email().max(256).required(),
    user: yup.string().max(64).required(),
    pass: yup.string().min(8).required(),
    disp: yup.string().max(32).required(),
    sex: yup.number().required(),
});

/** @type {import("express").RequestHandler} */
function post(req, res) {
    /** @type {import("../controllers/redis")} */
    const mysql = req.mysql;

    (async() => {
        try {
            const { email, user, pass, disp, sex } = req.body;

            let _q = await mysql.query("SELECT * FROM USER WHERE userEmail=? OR userID=?", [email, user]);
            if (_q.length) {
                return res.status(403).json({
                    c: 403,
                    d: "Forbidden",
                    e: "동일한 사용자 이름 또는 이메일로 가입 된 계정이 있습니다."
                });
            }

            const hashUUID = crypto.createHash("sha256")
                .update(`${email}/${user}/${new Date().toISOString()}`)
                .digest('hex');
            
            const hashPassword = crypto.createHash("sha256")
                .update(pass + "/genshin").digest('hex');

            await mysql.query("INSERT INTO USER (UUID, userEmail, userID, userPW, userName, userSEX) VALUES (?, ?, ?, ?, ?, ?)", [hashUUID, email, user, hashPassword, disp, sex]);

            return res.status(200).json({
                c: 200,
                d: null,
                m: "회원가입에 성공하였습니다."
            });
        } catch(e) {
            throw e;
        }
    })();
}

module.exports = {
    path: "/register",
    schema,
    post
}