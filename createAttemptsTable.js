const db = require("./db");

db.run(

    `

    CREATE TABLE IF NOT EXISTS attempts (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        paper_id INTEGER,

        score REAL,

        correct INTEGER,

        wrong INTEGER,

        unattempted INTEGER,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )

    `,

    err => {

        if(err){

            console.log(err);

        }
        else{

            console.log(
                "Attempts table created"
            );

        }

    }

);