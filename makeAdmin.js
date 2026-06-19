const db = require("./db");

db.run(

    `

    UPDATE users

    SET role = 'admin'

    WHERE email = ?

    
    `,

    [

        "hans004333@gmail.com"

    ],

    function(err){

        if(err){

            console.log(err);

            return;

        }

        console.log(
            "Admin Created"
        );

    }

);