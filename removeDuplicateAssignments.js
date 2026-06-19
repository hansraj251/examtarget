const db = require("./db");

db.run(

    `

    DELETE FROM paper_questions

    WHERE rowid NOT IN (

        SELECT MIN(rowid)

        FROM paper_questions

        GROUP BY

        paper_id,

        question_id

    )

    `,

    function(err){

        if(err){

            console.log(err);

            return;

        }

        console.log(

            "Duplicates Removed"

        );

    }

);