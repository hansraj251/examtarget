const db = require("./db");

db.all(

    "PRAGMA table_info(questions)",

    [],

    (err, rows) => {

        if(err){

            console.log(err);

            return;

        }

        // console.log(rows);

    }

);