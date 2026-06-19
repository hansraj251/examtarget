fetch(

    "/api/check-session"

)

.then(

    res => res.json()

)

.then(

    data => {

        if(

            data.role !==

            "admin"

        ){

            res.status(403).json({

    message:

    "Access Denied"

});

            window.location.href = "home.html"

        }

    }

);
const db = require("./db");

db.all(

    "SELECT * FROM questions",

    [],

    (err, rows) => {

        // console.log(rows);

    }

);