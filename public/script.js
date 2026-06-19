let questions = [];
let currentQuestion = 0;
let questionStatus = {};
let userAnswers = {};
let timeLeft = 60 * 60;
let timerId;

fetch("/api/questions")
.then(response => response.json())
.then(data => {

    questions = data;

    createPalette();
    const savedQuestion =
    localStorage.getItem(
        "currentQuestion"
    );

if(savedQuestion){

    currentQuestion =
        parseInt(savedQuestion);

}

    loadQuestion();

    updatePalette();

    startTimer();

    const savedAnswers =
    localStorage.getItem("userAnswers");

if(savedAnswers){

    userAnswers =
        JSON.parse(savedAnswers);

}

});


function loadQuestion(){

    const q = questions[currentQuestion];

    if(!questionStatus[q.id]){
    questionStatus[q.id] = "notVisited";
}

    document.getElementById("question").innerText =
        q.question;

    let html = "";

    q.options.forEach(option => {

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
            ${option}
        </label>
        <br>
        `;

    });

    document.getElementById("options").innerHTML = html;

    updatePalette();


};    

function markForReview(){

    const q = questions[currentQuestion];

    questionStatus[q.id] = "review";

    updatePalette();

    nextQuestion();

}
function clearResponse(){

    const q = questions[currentQuestion];

    delete userAnswers[q.id];

    questionStatus[q.id] = "notAnswered";

    loadQuestion();

}

function nextQuestion(){
    saveAnswer();

    if(currentQuestion < questions.length - 1){
        currentQuestion++;
        loadQuestion();
    }
    localStorage.setItem(
    "currentQuestion",
    currentQuestion
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

        alert(
            data.message
        );

    });

}
function previousQuestion(){
    saveAnswer();

    if(currentQuestion > 0){
        currentQuestion--;
        loadQuestion();
    }
    localStorage.setItem(
    "currentQuestion",
    currentQuestion
);

}
function saveAnswer(){

    const selected = document.querySelector(
        'input[name="answer"]:checked'
    );

    const q = questions[currentQuestion];

    if(selected){

        userAnswers[q.id] = selected.value;

        questionStatus[q.id] = "answered";

    }
    else{

        questionStatus[q.id] = "notAnswered";

    }
    localStorage.setItem(
    "userAnswers",
    JSON.stringify(userAnswers)
);

}
function submitAnswer(){

    saveAnswer();

    fetch("/api/submit",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(userAnswers)

    })

    .then(res => res.json())

    .then(result => {
      console.log(result);

    document.getElementById(
        "testContainer"
    ).style.display = "none";

    document.getElementById(
        "result"
    ).style.display = "block";

    document.getElementById(
        "finalScore"
    ).innerText =
        "Score : " +
        result.score +
        "/" +
        result.total;

      let reviewHtml = "";

    result.review.forEach(item => {

        reviewHtml += `

            <div>

                <h3>${item.question}</h3>

                <p>

                Your Answer :

                ${item.yourAnswer}

                </p>

                <p>

                Correct Answer :

                ${item.correctAnswer}

                </p>

            </div>

            <hr>

        `;

    });

    document.getElementById(
        "review"
    ).innerHTML = reviewHtml;

    document.getElementById(
        "correctCount"
    ).innerText =
        "Correct : " +
        result.correct;

    document.getElementById(
        "wrongCount"
    ).innerText =
        "Wrong : " +
        result.wrong;

    document.getElementById(
        "unattemptedCount"
    ).innerText =
        "Unattempted : " +
        result.unattempted;
         });
         localStorage.removeItem(
    "userAnswers"
);

localStorage.removeItem(
    "currentQuestion"
);

}   

function createPalette(){

    let html = "";

    questions.forEach((q,index)=>{

        html += `
        <button
            onclick="goToQuestion(${index})"
        >
            ${index+1}
        </button>
        `;

    });

    document.getElementById("palette")
        .innerHTML = html;

}
function goToQuestion(index){

    saveAnswer();

    currentQuestion = index;

    loadQuestion();

}

function updatePalette(){

    const buttons =
        document.querySelectorAll(
            "#palette button"
        );

    buttons.forEach((btn,index)=>{

        const q = questions[index];

        btn.className =
            questionStatus[q.id] || "";

        if(index === currentQuestion){

            btn.classList.add("current");

        }

    });

}

function startTimer(){
    
    timerId = setInterval(()=>{

        let minutes =
            Math.floor(timeLeft/60);

        let seconds =
            timeLeft%60;

        document.getElementById("timer")
            .innerText =
            minutes + ":" +
            String(seconds)
            .padStart(2,"0");

        timeLeft--;

        if(timeLeft < 0){
            clearInterval(timerId);
            submitAnswer();

        }

    },1000);
  }
