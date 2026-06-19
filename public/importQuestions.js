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
function uploadExcel(){

    const file =

    document.getElementById(

        "excelFile"

    ).files[0];

    if(!file){

        alert(

            "Select Excel File"

        );

        return;

    }

    const formData =

    new FormData();

    formData.append(


        "file",

        file

    );

    fetch(

        "/api/import-questions",

        {

            method:"POST",

            body:formData

        }

    )

    .then(

        res => res.json()

    )

    .then(

        data => {

            alert(

                data.message

            );
            alert("Questions Imported Successfully");

        }

    );

}