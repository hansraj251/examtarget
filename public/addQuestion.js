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
function addQuestion(){
    const question =

document.getElementById(
    "question"
).value.trim();

if(!question){

    alert(
        "Please enter question"
    );

    return;
}

    fetch("/api/add-question",{

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            section:
            document.getElementById(
                "section"
            ).value,

            question:
            document.getElementById(
                "question"
            ).value,

            optionA:
            document.getElementById(
                "optionA"
            ).value,

            optionB:
            document.getElementById(
                "optionB"
            ).value,

            optionC:
            document.getElementById(
                "optionC"
            ).value,

            optionD:
            document.getElementById(
                "optionD"
            ).value,

            answer:
            document.getElementById(
                "answer"
            ).value


        })

    })

    .then(res => res.json())

    .then(data => {

        
        showAddQuestion();

    });

}