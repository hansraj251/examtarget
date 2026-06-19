const db = require("./db");

db.all(

    "SELECT * FROM papers",

    [],

    (err, rows) => {

        // console.log(rows);

    }

);