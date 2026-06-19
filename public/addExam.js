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
function addExam(){

    const name =
    document.getElementById(
        "examName"
    ).value;

    const subtitle =
    document.getElementById(
        "examSubtitle"
    ).value;

    const logoId =
    document.getElementById(
        "logoId"
    ).value;

    if(!name){

        alert(
            "Please enter exam name"
        );

        return;

    }

    console.log(
        "NAME:",
        name
    );

    console.log(
        "SUBTITLE:",
        subtitle
    );

    console.log(
        "LOGO ID:",
        logoId
    );

    fetch(

        "/api/add-exam",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                name,
                subtitle,
                logo_id:logoId

            })

        }

    )

    .then(
        res => res.json()
    )

    .then(data => {

        alert(
            data.message
        );

        loadExams();

    })

    .catch(err=>{

        console.log(err);

        alert(
            "Error"
        );

    });

}