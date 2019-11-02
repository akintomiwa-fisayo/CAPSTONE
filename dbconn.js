const {Pool, Client} = require('pg');
const connectionString = 'postgressql://postgres:root@localhost:8001/capstonedb';

const client = new Client({
    connectionString: connectionString
});

module.exports = client;
// client.connect();

/* client.query('SELECT * from employees', (err, res) => {
    console.log(err, res);
    client.end();
});
 */