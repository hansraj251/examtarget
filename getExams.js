const db = require("./db");

db.all(

    "SELECT * FROM exams",

    [],

    (err, rows) => {

        // console.log(rows);

    }

);