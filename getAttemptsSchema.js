const db = require("./db");

db.all(

    "PRAGMA table_info(attempts)",

    [],

    (err, rows) => {

        // console.log(rows);

    }

);