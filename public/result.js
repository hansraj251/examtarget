function loadResult(){
    const result =

JSON.parse(

    localStorage.getItem(

        "resultData"

    )

);
window.reviewData = result.review;

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
   let html = "";
   const groupedSections = {};

result.review.forEach(item => {

    if(!groupedSections[item.section]){

        groupedSections[item.section] = [];

    }

    groupedSections[item.section].push(item);

});
let reviewIndex = 0;

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
        const currentIndex = reviewIndex++;
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

            <h3>

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
onclick="reviewQuestion(${currentIndex})"
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

).innerHTML = html; if (window.MathJax) {

    MathJax.typesetPromise();

}
result.review.forEach(

    item => {

        if(

            !sections[
                item.section
            ]

        ){

            sections[
                item.section
            ] = {

                correct:0,

                wrong:0,

                unattempted:0

            };

        }

        if(

            item.status ===

            "Correct"

        ){

            sections[
                item.section
            ].correct++;

        }

        else if(

            item.status ===

            "Wrong"

        ){

            sections[
                item.section
            ].wrong++;

        }

        else{

            sections[
                item.section
            ].unattempted++;

        }

    }

);

let sectionHtml = "";
for(

    let section

    in

    sections

){

    sectionHtml += `

    <div
    style="

        border:1px solid #ddd;

        padding:15px;

        margin-bottom:10px;

        border-radius:8px;

    ">

        <h3>

            ${section}

        </h3>

        <p>

            Correct :

            ${sections[section].correct}

        </p>

        <p>

            Wrong :

            ${sections[section].wrong}

        </p>

        <p>

            Unattempted :

            ${sections[section].unattempted}

        </p>

    </div>

    `;

}
document.getElementById(
    "sectionAnalysis"
).innerHTML =
    summaryHtml + sectionHtml;}

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
function reviewQuestion(index){

    const item =
    window.reviewData[index];

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

        <h2>
        Q${item.questionNo}
        </h2>

        <p>${item.question}</p>

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