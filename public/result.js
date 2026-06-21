function loadResult(){
    const result =

JSON.parse(

    localStorage.getItem(

        "resultData"

    )

);
window.reviewData = result.review;
window.filteredReviewData =
result.review;

if(!result){

    alert(

        "No Result Found"

    );

    window.location.href =

    "home.html";

}

console.log(result);
console.log(result.review);

console.log(result);
    console.log(result.review);

document.getElementById(

    "score"

).innerText =

    "Score : " +

    result.score;

document.getElementById(

    "correct"

).innerText =

    "Correct : " +

    result.correct;

document.getElementById(

    "wrong"

).innerText =

    "Wrong : " +

    result.wrong;

document.getElementById(

    "unattempted"

).innerText =

    "Unattempted : " +

    result.unattempted;
    const totalTime =
result.review.reduce(
    (sum, item) =>
    sum + (item.timeSpent || 0),
    0
);

const avgTime =
result.review.length
? (
    totalTime /
    result.review.length
).toFixed(1)
: 0;

const fastestQuestion =
Math.min(
    ...result.review.map(
        q => q.timeSpent || 0
    )
);

const slowestQuestion =
Math.max(
    ...result.review.map(
        q => q.timeSpent || 0
    )
);

document.getElementById(
    "sectionAnalysis"
).innerHTML = `

<div style="
    background:#f8fafc;
    border:1px solid #ddd;
    padding:15px;
    border-radius:8px;
    margin-bottom:15px;
">

<h3>
⏱ Total Time:
${totalTime} sec
</h3>

<h3>
📊 Average Time:
${avgTime} sec/question
</h3>

<h3>
🚀 Fastest Question:
${fastestQuestion} sec
</h3>

<h3>
🐢 Slowest Question:
${slowestQuestion} sec
</h3>

</div>

`;
let summaryHtml = `

<div style="
background:#f8fafc;
border:1px solid #ddd;
padding:15px;
border-radius:8px;
margin-bottom:15px;
">

<h3>⏱ Total Time: ${totalTime} sec</h3>

<h3>📊 Average Time: ${avgTime} sec/question</h3>

<h3>🚀 Fastest Question: ${fastestQuestion} sec</h3>

<h3>🐢 Slowest Question: ${slowestQuestion} sec</h3>

</div>

`;
renderQuestionAnalysis(

    result.review

); 

if (window.MathJax) {

    MathJax.typesetPromise();

}

}

function reAttempt(){


    localStorage.removeItem(

        "examCompleted"

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
localStorage.removeItem(

    "testAbandoned"

);

    window.location.href =

"home.html?instruction=" +

localStorage.getItem(

    "paperId"

);

}
function reviewQuestion(questionNo){

     const item = window.reviewData.find(

        q => q.questionNo === questionNo

    );

    if(!item){

        console.log("Question not found");

        return;

    }

    let optionsHtml = "";

    item.options.forEach(option => {

        let bg = "";

        if(option === item.correctAnswer){

            bg = "#dcfce7";

        }

        if(
            option === item.yourAnswer &&
            item.yourAnswer !== item.correctAnswer
        ){

            bg = "#fee2e2";

        }

        optionsHtml += `

        <div style="
            padding:10px;
            margin:5px 0;
            background:${bg};
            border-radius:6px;
        ">
            ${option}
        </div>

        `;

    });

    document.getElementById(
        "reviewQuestionContent"
    ).innerHTML = `

        <div
style="
text-align:justify;
line-height:1.7;
padding-left:15px;
padding-right:25px;
margin-bottom:15px;
"
>
${item.question}
</div>

        ${optionsHtml}

        <p>
        <b>Your Answer:</b>
        ${item.yourAnswer}
        </p>

        <p>
        <b>Correct Answer:</b>
        ${item.correctAnswer}
        </p>

    `;

    document.getElementById(
        "reviewModal"
    ).style.display = "block";

}
function closeReviewModal(){

    document.getElementById(
        "reviewModal"
    ).style.display = "none";

}
function renderQuestionAnalysis(reviewData){

    let html = "";
   const groupedSections = {};

reviewData.forEach(item => {

    if(!groupedSections[item.section]){

        groupedSections[item.section] = [];

    }

    groupedSections[item.section].push(item);

});

Object.keys(groupedSections).forEach(section => {

    html += `

    <h2

    style="

        margin-top:30px;

        padding:10px;

        background:#e5e7eb;

        border-radius:8px;

    ">

        ${section}

        (${groupedSections[section].length} Questions)

    </h2>

    `;

    groupedSections[section].forEach((item,index) => {
         const sectionQuestionNo = index + 1;

        let cardColor = "#f8fafc";

        if(item.status === "Correct"){

            cardColor = "#dcfce7";

        }

        else if(item.status === "Wrong"){

            cardColor = "#fee2e2";

        }

        else{

            cardColor = "#fef9c3";

        }
        let statusIcon = "⚪";
        

if(item.status === "Correct"){

    statusIcon = "✅";

}
else if(item.status === "Wrong"){

    statusIcon = "❌";

}

        html += `
        

        <div
        style="
            background:${cardColor};
            border:1px solid #ddd;
            padding:15px;
            margin-bottom:10px;
            border-radius:8px;
        "
        >

            <h3
style="
text-align:justify;
line-height:1.7;
padding-left:15px;
padding-right:15px;
"
>

Q${sectionQuestionNo}. ${item.question}

</h3>

            <p>
                Your Answer:
                ${item.yourAnswer}
            </p>

            <p>
                Correct Answer:
                ${item.correctAnswer}
            </p>

            <p>
                ⏱ Time Spent:
                <b>${item.timeSpent || 0} sec</b>
            </p>

            <p>

    Status:

    ${statusIcon} ${item.status}

</p>
<button
class="test-btn"
onclick="reviewQuestion(${item.questionNo})"
>
Review Question
</button>

        </div>

        `;

    });

});
const sections = {};
document.getElementById(

    "analysis"

).innerHTML = html;

}
function filterQuestions(){

    const filter =
    document.getElementById(
        "questionFilter"
    ).value;

    let filtered =
    window.reviewData;

    if(filter !== "All"){

        filtered =
        window.reviewData.filter(

            item =>
            item.status === filter

        );

    }

    renderQuestionAnalysis(
    filtered
);

}
