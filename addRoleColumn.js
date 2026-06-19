const db = require("./db");

db.run(

    `

    ALTER TABLE users

    ADD COLUMN role TEXT

    `,

    err => {

        if(err){

            console.log(err);

            return;

        }

        console.log(
            "Role column added"
        );

    }

);