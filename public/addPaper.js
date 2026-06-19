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
function loadExamDropdown(){

    fetch("/api/exams")

    .then(res => res.json())

    .then(exams => {

        let html = "";

        exams.forEach(exam => {

            html += `

            <option
                value="${exam.id}">

                ${exam.name}

            </option>

            `;

        });

        const select =

        document.getElementById(
            "examSelect"
        );

        if(select){

            select.innerHTML =
            html;

        }

    });

}

function addPaper(){
    const paperCode =
document.getElementById(
    "paperCode"
).value.trim();

if(!paperCode){

    alert(
        "Paper Code Required"
    );

    return;

}
    const paperName =

document.getElementById(

    "paperName"

).value.trim();

if(!paperName){

    alert(

        "Please enter paper name"

    );

    return;

}
const examId =

document.getElementById(

    "examSelect"

).value;

if(!examId){

    alert(

        "Please select exam"

    );

    return;

}

    const exam_id =

        document.getElementById(
            "examSelect"
        ).value;

    const name =

        document.getElementById(
            "paperName"
        ).value;
        const subtitle =

document.getElementById(
    "paperSubtitle"
).value.trim();

const language =

document.getElementById(
    "paperLanguage"
).value;
        

    fetch("/api/add-paper",{

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

    exam_id,
    name,
    subtitle,
    language,
    paper_code:
document.getElementById(
    "paperCode"
).value

})

    })

    .then(async res => {

    const data =

    await res.json();

    if(

        !res.ok

    ){

        

        return;

    }

    
    showAddPaper();

    });

}
