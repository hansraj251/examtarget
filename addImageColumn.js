const db = require("./db");

db.run(

    `

    ALTER TABLE questions

    ADD COLUMN image_url TEXT

    `,

    err => {

        if(err){

            console.log(err);

            return;

        }

        console.log(

            "image_url added"

        );

    }

);