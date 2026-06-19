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
function renameExam(
    id,
    currentName,
    currentSubtitle
){

    const name = prompt(
        "New Exam Name",
        currentName
    );

    if(name === null){
        return;
    }

    const subtitle = prompt(
        "New Exam Subtitle",
        currentSubtitle || ""
    );

    if(subtitle === null){
        return;
    }

    fetch(
        "/api/rename-exam",
        {
            method:"POST",
            headers:{
                "Content-Type":
                "application/json"
            },
            body:JSON.stringify({
                id,
                name,
                subtitle,
                role:
                localStorage.getItem(
                    "role"
                )
            })
        }
    )
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        showAllExams();

    });

}

function deleteExam(id){

    showConfirmModal(

        "Delete Exam",

        "Delete this exam and all related papers?",

        function(){

            actualDeleteExam(id);

        }

    );

}

function actualDeleteExam(id){
console.log(

        "ACTUAL DELETE:",

        id

    );
    fetch(

        "/api/delete-exam",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                id,

                role:

                localStorage.getItem(

                    "role"

                )

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

            location.reload();

        }

    );

}

function loadExams(){

    fetch("/api/exams")

    .then(res => res.json())

    .then(exams => {

        let html = "";

        exams.forEach(exam => {

            html += `

<div class="exam-item">

    <div class="exam-left">

    <input
    type="checkbox"
    class="examCheck"
    value="${exam.id}"
    onchange="updateRenameButtons()">

    <div>

        <div>
            ${exam.name}
        </div>

        <div

class="exam-subtitle"

style="

    font-size:12px;

    color:#666;

">

    ${exam.subtitle || ""}

</div>

    </div>

</div>
    <button
    class="renameBtn"
    onclick='renameExam(
${exam.id},
${JSON.stringify(exam.name)},
${JSON.stringify(exam.subtitle || "")}
)'

        Rename

    </button>

</div>

`;

        });

        const examsDiv =
document.getElementById(
    "exams"
);

if(examsDiv){

    examsDiv.innerHTML = html;

}

    });

}
function filterExamsBySubtitle(){

    const search = document
        .getElementById("subtitleFilter")
        .value
        .toLowerCase()
        .trim();

    document
        .querySelectorAll(".exam-item")
        .forEach(item => {

            const subtitle =
                item.querySelector(".exam-subtitle")
                ?.textContent
                .toLowerCase() || "";

            item.style.display =
                subtitle.includes(search)
                ? ""
                : "none";
        });
}
function deleteSelectedExams(){

    const checks =

    document.querySelectorAll(

        ".examCheck:checked"

    );

    const ids = [];

    checks.forEach(c => {

        ids.push(

            Number(c.value)

        );

    });

    if(ids.length === 0){

        alert(

            "Select at least one exam"

        );

        return;

    }

    showConfirmModal(

    "Delete Exams",

    "Delete selected exams?",

    function(){

        actualDeleteSelectedExams(ids);

    }

);
}
function actualDeleteSelectedExams(ids){

    fetch(

        "/api/delete-exams",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                ids,

                role:

                localStorage.getItem(

                    "role"

                )

            })

        }

    )

    .then(res => res.json())

    .then(data => {

        loadExams();

    });

}
function updateRenameButtons(){

    const selected =

    document.querySelectorAll(

        ".examCheck:checked"

    ).length;

    const buttons =

    document.querySelectorAll(

        ".renameBtn"

    );

    buttons.forEach(btn => {

        if(selected > 1){

            btn.style.display =

            "none";

        }
        else{

            btn.style.display =

            "inline-block";

        }

    });

}