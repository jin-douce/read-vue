const mysql = require('mysql');

const pool = new mysql.createPool({
    host: '47.93.40.207',
    user: 'root',
    password: '12345',
    database: 'book',
    port: 3306
})

// const pool = new mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'book',
//     port: 3306
// })

const connectMysql = function (sql, callback) {
    pool.getConnection(function (err, connection) {
        connection.query(sql, function (error, results, fields) {
            connection.release();
            callback(error, results, fields)
        })
    })
}

module.exports = connectMysql
