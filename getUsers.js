const db = require("./db");

db.all(

    "SELECT * FROM users",

    [],

    (err, rows) => {

        // console.log(rows);

    }

);