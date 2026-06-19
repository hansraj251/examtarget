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
        'SSC CGL Paper 1',
        0

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