const db = require("./db");

db.run(

    `

    UPDATE users

    SET role = 'user'

    WHERE id = 2

    `,

    err => {

        if(err){

            console.log(err);

        }
        else{

            console.log(

                "Role Updated"

            );

        }

    }

);