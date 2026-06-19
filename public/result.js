function loadResult(){
    const result =

JSON.parse(

    localStorage.getItem(

        "resultData"

    )

);

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

result.review.forEach(

    item => {

        html += `

        <div
        style="

            border:1px solid #ddd;

            padding:15px;

            margin-bottom:10px;

            border-radius:8px;

        ">

            <h3>

                ${item.question}

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

                ${item.status}

            </p>

        </div>

        `;

    }

);
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