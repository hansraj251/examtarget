const db = require("./db");

db.all(

    "SELECT * FROM questions",

    [],

    (err, rows) => {

        if(err){

            console.log(err);

            return;

        }

        // console.log(rows);

    }

);