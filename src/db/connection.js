const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fuxion',
    multipleStatements: true
})
connection.connect((error) => {
    if (error) {
        console.error('connection failed: ' + error);
        return
    }
    console.log('connection established');
})

module.exports = connection;