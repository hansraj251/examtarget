const db = require("./db");

db.all(

    "SELECT * FROM attempts",

    [],

    (err, rows) => {

        // console.log(rows);

    }

);