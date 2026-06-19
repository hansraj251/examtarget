if(

    localStorage.getItem(

        "role"

    ) !== "admin"

){

    res.status(403).json({

    message:

    "Access Denied"

});

    window.location.href = "home.html"

}
const db = require("./db");

db.run(

    "DELETE FROM questions WHERE id = ?",

    [1],

    function(err){

        if(err){

            console.log(err);
            return;

        }

        console.log(
            "Question Deleted"
        );

    }

);