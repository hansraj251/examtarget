const db = require("./db");

db.run(

    `

    INSERT INTO papers (

        exam_id,
        name,
        is_paid

    )

    VALUES (

        1,
        'SSC CGL Paper 2',
        1

    )

    `,

    [],

    function(err){

        if(err){

            console.log(err);
            return;

        }

        console.log(
            "Paper Added"
        );

    }

);