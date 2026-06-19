const db = require("./db");

db.all(

    `

    SELECT *

    FROM paper_questions

    LIMIT 20

    `,

    [],

    (err, rows) => {

        if(err){

            console.log(err);

            return;

        }

        // console.log(rows);

    }

);