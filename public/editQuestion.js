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
const id =

new URLSearchParams(

    window.location.search

).get("id");

fetch(

    "/api/question/" +

    id

)

.then(

    res => res.json()

)

.then(q => {

    document.getElementById(

        "section"

    ).value = q.section;

    document.getElementById(

        "question"

    ).value = q.question;

    document.getElementById(

        "optionA"

    ).value = q.optionA;

    document.getElementById(

        "optionB"

    ).value = q.optionB;

    document.getElementById(

        "optionC"

    ).value = q.optionC;

    document.getElementById(

        "optionD"

    ).value = q.optionD;

    document.getElementById(

        "answer"

    ).value = q.answer;
    document.getElementById(

    "image_url"

).value =

q.image_url || "";

});

function updateQuestion(){

    fetch(

        "/api/update-question",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                id,

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
                ,

image_url:

document.getElementById(

    "image_url"

).value

            })

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

            window.location.href =

            "viewQuestions.html";

        }

    );

}fetch("/api/questions-db")

.then(res => res.json())

.then(questions => {

    const sections =

    [...new Set(

        questions.map(

            q => q.section

        )

    )];

    let html = "";

    sections.forEach(section => {

        html += `

        <option
        value="${section}">

            ${section}

        </option>

        `;

    });

    document.getElementById(

        "section"

    ).innerHTML = html;

});