window.addEventListener(

    "pageshow",

    function(){

        localStorage.setItem(

            "testAbandoned",

            "no"

        );

    }

);
if(

    localStorage.getItem(

        "testAbandoned"

    ) === "yes"

){

    localStorage.removeItem(

        "testAbandoned"

    );

    // alert(

    //     "Previous test session was abandoned."

    // );

    localStorage.setItem(

    "showInstructions",

    localStorage.getItem(

        "paperId"

    )

);

window.location.href =

    "home.html";

}

let paperSettings = {};
let sectionTimes = {};
let timeLeft = 0;


window.addEventListener(

    "beforeunload",

    function(){

        localStorage.setItem(

            "testAbandoned",

            "yes"

        );

    }

);
history.pushState(
    null,
    "",
    location.href
);


let questions = [];

let currentQuestion =

Number(

    localStorage.getItem(

        "currentQuestion"

    )

) || 0;

let userAnswers =

JSON.parse(

    localStorage.getItem(

        "userAnswers"

    )

) || {};

let questionStatus =

JSON.parse(

    localStorage.getItem(

        "questionStatus"

    )

) || {};

let questionStartTime = Date.now();
if(
    localStorage.getItem(
        "newAttempt"
    ) === "yes"
){
    
    localStorage.removeItem(
        "questionTimes"
    );

    localStorage.removeItem(
        "questionStatus"
    );

    localStorage.removeItem(
        "newAttempt"
    );

}
let questionTimes =
JSON.parse(
    localStorage.getItem(
        "questionTimes"
    )
) || {};


let timerInterval;

let paperId = null;

function initTest(){
    paperId = localStorage.getItem(

        "paperId"

    );


    if(

        !paperId

    ){

        alert(

            "Paper ID Missing"

        );

        return;

    }

fetch(

    "/api/paper/" +

    paperId +

    "/questions"

)

.then(res => {

    

    if(res.status === 403){

    localStorage.setItem(
        "showPremiumPage",
        "yes"
    );

    showPremiumPlans();

    return Promise.reject(
    "Premium Required"
);

}

    return res.json();

})

.then(data => {

    questions = data;
    if(

    !Array.isArray(
        data
    )

){

    return;

}

    createPalette();

    loadQuestion();

    return fetch(

        "/api/paper-settings/" +

        paperId

    );

})

.then(res => res.json())

.then(settings => {

    paperSettings = settings;
   

    return fetch(

        "/api/section-times/" +

        paperId

    );

})

.then(res => res.json())

.then(rows => {

    rows.forEach(row => {

        sectionTimes[
            row.section_name
        ] =

        row.duration_minutes * 60;

    });

    const currentSection =

    questions[currentQuestion]

    .section;

    const savedTime =

    localStorage.getItem(

        "sectionTimeLeft"

    );

    if(

        savedTime !== null

    ){

        timeLeft =

        Number(

            savedTime

        );

    }
    else{

    if(
    paperSettings.show_section_timer ===
    "section"
){

    timeLeft =
    sectionTimes[
        currentSection
    ];

}
else{

    timeLeft =
    Number(
        paperSettings.duration_minutes
    ) * 60;

}

}

    startTimer();

})

.catch(err => {

    if(
        err ===
        "Premium Required"
    ){

        return;

    }

    showDashboard();

});
 }


function loadQuestion(){
    questionStartTime = Date.now();
    if(

        questions.length === 0

    ){

        alert(

            "No questions found."

        );

        localStorage.removeItem(

            "paperId"

        );

        localStorage.removeItem(

            "examRunning"

        );

        localStorage.removeItem(

            "currentQuestion"

        );

        localStorage.removeItem(

            "userAnswers"

        );

        localStorage.removeItem(

            "questionStatus"

        );

        localStorage.removeItem(

            "showInstructions"

        );

        window.location.href =

        "home.html";

        return;

    }

    const q = questions[currentQuestion];
    if(

    !questionStatus[q.id]

){

    questionStatus[q.id] =

        "notVisited";

}

    document.getElementById(
    "question"
).innerHTML =

    "<div class='question-number'>Question " +

    (currentQuestion + 1) +

    "</div>" +

    "<div class='question-text'>" +

    q.question +

    "</div>";
if (window.MathJax) {

    MathJax.typesetPromise();

}
    
    if(q.image_url){

    document.getElementById(

        "questionImage"

    ).innerHTML =

    `

    `;

}
else{

    document.getElementById(

        "questionImage"

    ).innerHTML = "";

}
console.log("OPTION A =", q.optionA);
console.log("OPTION B =", q.optionB);
console.log("OPTION C =", q.optionC);
console.log("OPTION D =", q.optionD);

    let html = "";

    q.options = [

        q.optionA,
        q.optionB,
        q.optionC,
        q.optionD

    ];
    document.getElementById(

    "paletteTitle"

).innerText =

    q.section;
    createPalette();
    
const labels = [
    "A",
    "B",
    "C",
    "D"
];

q.options.forEach((option,index) => {

    const checked =

        userAnswers[q.id] === option

        ? "checked"

        : "";

    html += `

        <label>

            <input
                type="radio"
                name="answer"
                value="${option}"
                ${checked}
            >

            <b>${labels[index]}.</b>
            ${option}

        </label>

        <br>

    `;

});

    document.getElementById(
        "options"
    ).innerHTML = html;
    if (window.MathJax) {

    MathJax.typesetPromise();

}
    updatePalette();
    const btn =
document.getElementById(
    "bookmarkBtn"
);

if(

    bookmarkedQuestions.includes(
        q.id
    )

){

    btn.innerHTML =
    "⭐ Bookmarked";

    btn.classList.add(
        "bookmarked-btn"
    );

}
else{

    btn.innerHTML =
    "☆ Bookmark";

    btn.classList.remove(
        "bookmarked-btn"
    );

}

}
function saveAnswer(){

    const selected =

        document.querySelector(

            'input[name="answer"]:checked'

        );

    const q =

        questions[currentQuestion];

    if(selected){

        userAnswers[q.id] =

            selected.value;

        questionStatus[q.id] =

            "answered";

    }
    else{

        questionStatus[q.id] =

            "notAnswered";

    }
    localStorage.setItem(

    "userAnswers",

    JSON.stringify(

        userAnswers

    )

);

localStorage.setItem(

    "questionStatus",

    JSON.stringify(

        questionStatus

    )

);

}

function saveAndNext(){
     saveQuestionTime();

    saveAnswer();

    if(
        currentQuestion <
        questions.length - 1
    ){

        const oldSection =

        questions[currentQuestion]

        .section;

       const nextSection =

questions[currentQuestion + 1]

?.section;
 if(
    paperSettings.section_navigation === "locked" &&
    oldSection !== nextSection
){

    const proceed = confirm(
        "⚠️ You are moving to the next section. After proceeding, you will not be able to return to the previous section. Continue?"
    );

    if(!proceed){

        return;

    }

}

        currentQuestion++;

        const newSection =

        questions[currentQuestion]

        .section;

       if(
    oldSection !==
    newSection &&
    paperSettings.show_section_timer ===
    "section"
){

    clearInterval(
        timerInterval
    );

    timeLeft =
    sectionTimes[newSection];

    startTimer();

}

        localStorage.setItem(

            "currentQuestion",

            currentQuestion

        );

        loadQuestion();

    }
    else{

    openSubmitModal();

}

}

function previousQuestion(){
 saveQuestionTime();
    saveAnswer();

    if(

        currentQuestion <= 0

    ){

        return;

    }

    if(

        paperSettings.section_navigation ===

        "locked"

    ){

        const currentSection =

        questions[currentQuestion]

        .section;

        const previousSection =

        questions[currentQuestion - 1]

        .section;

        if(

            currentSection !==

            previousSection

        ){

            return;

        }

    }

    currentQuestion--;

    loadQuestion();

}

function clearResponse(){

    const q =

        questions[currentQuestion];

    delete userAnswers[q.id];

    questionStatus[q.id] =

        "notAnswered";

    loadQuestion();

}
function markForReview(){
 saveQuestionTime();
    saveAnswer();

    const q =
        questions[currentQuestion];

    if(userAnswers[q.id]){

        questionStatus[q.id] =
        "reviewAnswered";

    }
    else{

        questionStatus[q.id] =
        "review";

    }

    if(
        currentQuestion <
        questions.length - 1
    ){

        const oldSection =

questions[currentQuestion]

.section;

const nextSection =

questions[currentQuestion + 1]

?.section;

if(

    paperSettings.section_navigation === "locked" &&

    oldSection !== nextSection

){

    const proceed = confirm(

        "⚠️ You are moving to the next section. After proceeding, you will not be able to return to the previous section. Continue?"

    );

    if(!proceed){

        return;

    }

}
        currentQuestion++;

        loadQuestion();

    }
    else{

        openSubmitModal();

    }

}
function submitTest(){ saveQuestionTime();

    exitExamMode();
    localStorage.removeItem(
    "adminPreview"
);
    
    window.onbeforeunload = null;
    localStorage.removeItem(

    "testAbandoned"

);

    saveAnswer();

    fetch(

    "/api/submit-test",

    {

        method:"POST",

        headers:{

            "Content-Type":

            "application/json"

        },

        body:JSON.stringify({

            paper_id:

            paperId,

            userAnswers,

            questionTimes,

            positive_marks:

            paperSettings.positive_marks,

            negative_marks:

            paperSettings.negative_marks

        })

    }

)

.then(res => res.json())

.then(resultData => {

    localStorage.removeItem(

        "testAbandoned"

    );

    localStorage.setItem(

        "resultData",

        JSON.stringify(

            resultData

        )

    );

    clearInterval(

        timerInterval

    );

    localStorage.removeItem(

        "examRunning"

    );

    localStorage.removeItem(

        "currentQuestion"

    );

    localStorage.removeItem(

        "userAnswers"

    );

    localStorage.removeItem(

        "questionStatus"

    );

    localStorage.removeItem(

        "examEndTime"

    );

    localStorage.removeItem(

        "sectionTimeLeft"

    );

    localStorage.setItem(

        "examCompleted",

        "yes"

    );

    showResult();

});

}
function resetExamSession(){

    localStorage.removeItem(
        "examRunning"
    );

    localStorage.removeItem(
        "currentQuestion"
    );

    localStorage.removeItem(
        "userAnswers"
    );

    localStorage.removeItem(
        "questionStatus"
    );

    localStorage.removeItem(
        "examEndTime"
    );

    localStorage.removeItem(
        "sectionTimeLeft"
    );

}

function createPalette(){


    const currentSection =

    questions[currentQuestion]

    ?.section;

    let html = "";

    questions.forEach(

        (q,index) => {

            if(

                q.section ===

                currentSection

            ){

                html += `

                <button

                onclick="goToQuestion(${index})"

                >

                    ${index + 1}

                </button>

                `;

            }

        }

    );

    document.getElementById(

        "palette"

    ).innerHTML = html;

}

function goToQuestion(index){
saveQuestionTime();
    saveAnswer();

    currentQuestion = index;

    localStorage.setItem(
        "currentQuestion",
        currentQuestion
    );

    loadQuestion();

}
function updatePalette(){
    

    const currentSection =

    questions[currentQuestion]

    .section;

    const sectionQuestions =

    questions.filter(

        q =>

        q.section ===

        currentSection

    );

    const buttons =

    document.querySelectorAll(

        "#palette button"

    );

    buttons.forEach(

        (btn,index) => {

            const q =

            sectionQuestions[index];

            btn.className =

                questionStatus[q.id]

                || "";

            if(

                questions[currentQuestion]

                .id === q.id

            ){

                btn.classList.add(

                    "current"

                );

            }

        }

    );


}

function startTimer(){

    updateTimer();

    timerInterval =

        setInterval(

            () => {

                timeLeft--;
                localStorage.setItem(

    "sectionTimeLeft",

    timeLeft

);

                updateTimer();

                if(

                    timeLeft <= 0

                ){

                    clearInterval(

                        timerInterval

                    );
                    saveAnswer();

                    const currentSection =

                    questions[currentQuestion]

                    .section;

                    let nextIndex = -1;

                    for(

                        let i = currentQuestion + 1;

                        i < questions.length;

                        i++

                    ){

                        if(

                            questions[i]

                            .section !==

                            currentSection

                        ){

                            nextIndex = i;

                            break;

                        }

                    }

                    if(
    nextIndex !== -1 &&
    paperSettings.show_section_timer ===
    "section"
){

    currentQuestion =
    nextIndex;

    localStorage.setItem(
        "currentQuestion",
        currentQuestion
    );

    const newSection =
    questions[currentQuestion]
    .section;

    timeLeft =
    sectionTimes[
        newSection
    ];

    loadQuestion();

    startTimer();

}
else{
    saveAnswer();

    submitTest();

}
                }

            },

            1000

        );

}
function updateTimer(){

    const minutes =

        Math.floor(

            timeLeft / 60

        );

    const seconds =

        timeLeft % 60;

    document.getElementById(

        "timer"

    ).innerText =

        minutes +

        ":" +

        String(seconds)

        .padStart(

            2,

            "0"

        );

}

function toggleBookmark(){

    const questionId =
    questions[currentQuestion].id;

    fetch(

        "/api/bookmark-question",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                questionId

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        const btn =

        document.getElementById(
            "bookmarkBtn"
        );

        btn.innerHTML =
        "⭐ Bookmarked";

        btn.classList.add(
            "bookmarked-btn"
        );

    });

}

function saveQuestionTime(){

    const q = questions[currentQuestion];

    if(!q) return;

    const spentSeconds =
    Math.floor(
        (Date.now() - questionStartTime) / 1000
    );


    questionTimes[q.id] =
        (questionTimes[q.id] || 0)
        + spentSeconds;

    localStorage.setItem(
        "questionTimes",
        JSON.stringify(questionTimes)
    );
}