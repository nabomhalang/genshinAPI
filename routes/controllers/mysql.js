const mysql = require("mysql2");
const { DB_HOST } = require("../interfaces/config");

class MysqlConn {
    constructor() {
        this.sql = null;
        this.config = null;
    }

    /**
     * 
     * @param {string} user 
     * @param {string} pass 
     * @param {string} database 
     * @param {import("express").NextFunction} callback 
     */
    init(user, pass, database, callback) {
        this.config = {
            host: 'mariadb',
            user: user,
            password: pass,
            database: database,
            charset: 'utf8mb4'
        };

        this.sql = mysql.createPool(this.config);

        if (callback) callback(this);
    }

    /**
     * 
     * @param {mysql.Query} sql 
     * @param {Array} arr 
     */
    query(sql, arr) {
        return new Promise((resolve, reject) => {
            this.sql.query(sql, arr, (err, rows) => {
                if (err) return reject(err);
                return resolve(rows);
            });
        });
    }
}

module.exports = MysqlConn;