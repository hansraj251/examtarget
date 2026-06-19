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
let allQuestionsBank = [];
function loadQuestionBank(){

    const filter =
    document.getElementById(
        "questionFilter"
    )?.value || "all";

    fetch(
        "/api/questions-db?filter=" +
        filter
    )

    .then(res => res.json())

    .then(questions => {

        allQuestionsBank =
        questions;

        renderQuestions(
            questions
        );

    });

}


function actualDeleteQuestion(id){

    fetch(

        "/api/question/" + id,

        {

            method:"DELETE"

        }

    )

    .then(res => res.json())

    .then(data => {

    if(currentPreviewPaperId){

        checkPaper(
            currentPreviewPaperId
        );

    }else{

        showAddQuestion();

    }

});

}
function deleteQuestion(id){

    showConfirmModal(

        "Delete Question",

        "Delete this question permanently?",

        function(){

            actualDeleteQuestion(id);

        }

    );

}

function editQuestion(id){

    fetch(

        "/api/question/" + id

    )

    .then(res => res.json())

    .then(q => {

        document.getElementById(

            "content-area"

        ).innerHTML = `

<div class="profile-card">



<select id="section">

    <option value="${q.section}">
        ${q.section}
    </option>

</select>

<br><br>

<textarea
id="question"
rows="4"
>${q.question}</textarea>

<br><br>

<input
id="optionA"
value="${q.optionA}">

<br><br>

<input
id="optionB"
value="${q.optionB}">

<br><br>

<input
id="optionC"
value="${q.optionC}">

<br><br>

<input
id="optionD"
value="${q.optionD}">

<br><br>

<input
id="answer"
value="${q.answer}">

<br><br>

<input

id="image_url"

value="${q.image_url || ""}"

placeholder="Image File Name"

>

<br><br>

<button

class="save-btn"

onclick="updateQuestionInline(${q.id})"

>

Update Question

</button>

</div>

`;

    });

}
function updateQuestionInline(id){

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

                ).value,

                image_url:

                document.getElementById(

                    "image_url"

                ).value

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(

            data.message

        );

        if(

            editSource === "paper"

        ){

            checkPaper(

                currentPreviewPaperId

            );

        }

        else{

            showAllQuestions();

        }

    });

}
function renderQuestions(questions){

    let html = "";

    questions.forEach(q => {

        html += `

        <div>

    <div
style="
display:flex;
align-items:center;
justify-content:flex-start;
">

    <input
        type="checkbox"
        class="questionCheck"
        value="${q.id}"
        style="
        margin:0;
        margin-right:10px;
        width:18px;
        height:18px;
        flex:none;
        ">

    <span
        style="
        margin:0;
        padding:0;
        font-size:18px;
        font-weight:bold;
        display:inline;
        ">

        ID: ${q.id}

    </span>

</div>

            <p>

                Section:

                ${q.section}

            </p>

            <p>

                ${q.question}

            </p>

            <button

                onclick="

editSource='allQuestions';

editQuestion(${q.id})

"

            >

                Edit

            </button>

            <hr

style="

margin:20px 0;

">

        </div>

        `;

    });

    document.getElementById(

        "questions"

    ).innerHTML = html;

}
function actualDeleteSelectedQuestions(ids){

    fetch(

        "/api/delete-questions",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                ids

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{


        loadQuestionBank();

    });

}
function deleteSelectedQuestions(){

    const ids =

    [...document.querySelectorAll(

        ".questionCheck:checked"

    )]

    .map(

        cb => cb.value

    );
     console.log(ids);

    if(

        ids.length === 0

    ){

        alert(

            "Select Questions"

        );

        return;

    }

    showConfirmModal(

        "Delete Questions",

        "Delete selected questions permanently?",

        function(){

            actualDeleteSelectedQuestions(

                ids

            );

        }

    );

}
function searchQuestions(){

    const text =

    document.getElementById(

        "searchBox"

    ).value

    .toLowerCase();

    const filtered =

    allQuestionsBank.filter(

        q =>

        q.question

        .toLowerCase()

        .includes(text)

        ||

        q.section

        .toLowerCase()

        .includes(text)
        ||

        String(q.id)

        .includes(text)

    );

    renderQuestions(

        filtered

    );

}