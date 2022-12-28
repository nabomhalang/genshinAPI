const yup = require("yup");
const crypto = require("crypto");
const { create } = require("../utils");

const schema = yup.object({
    user: yup.string().required(),
    pass: yup.string().required()
});

/** @type {import("express").RequestHandler} */
function post(req, res, next) {
    /** @type {import("../controllers/mysql")} */
    const mysql = req.mysql;

    const unauthorized = () => {
        return res.status(401).json({
            c: 401,
            d: "Unauthorzied",
            e: "사용자 이름, 이메일 또는 비밀번호가 잘못되었습니다."
        });
    }

    (async () => {
        const { user, pass } = req.body;

        let userInfo = await mysql.query("SELECT * FROM USER WHERE userEmail=? OR userID=?", [user, user])

        if (!userInfo.length) return unauthorized();

        userInfo = userInfo[0];

        const hashPassword = crypto.createHash("sha256").update(pass + "/genshin").digest('hex');
        if (userInfo.userPW != hashPassword) return unauthorized();

        return res.json({
            c: 200,
            d: await create(JSON.stringify(userInfo))
        });
    })().catch(next);
}

module.exports = {
    path: "/login",
    schema,
    post
}