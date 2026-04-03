require('dotenv').config();
const pool = require('./config/database');

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tareas'")
    .then(res => {
        console.log(JSON.stringify(res.rows.map(r => r.column_name)));
        pool.end();
    })
    .catch(console.error);
