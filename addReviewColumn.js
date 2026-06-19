const db = require("./db");

db.run(

    `

    ALTER TABLE attempts

    ADD COLUMN review_json TEXT

    `,

    err => {

        if(err){

            console.log(err);

        }
        else{

            console.log(

                "review_json added"

            );

        }

    }

);