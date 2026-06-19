const db = require("./db");

db.run(

    "DELETE FROM questions",

    [],

    function(err){

        if(err){

            console.log(err);

            return;

        }

        console.log(
            "All questions deleted"
        );

    }

);