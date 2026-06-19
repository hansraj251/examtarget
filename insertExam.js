const db = require("./db");

db.run(

    `

    INSERT INTO exams (

        name

    )

    VALUES (

        'SSC CGL'

    )

    `,

    [],

    function(err){

        if(err){

            console.log(err);

            return;

        }

        console.log(
            "Exam Added"
        );

    }

);