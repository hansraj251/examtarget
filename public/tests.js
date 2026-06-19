function startTest(paperId){

    showInstructions(
        paperId
    );

}
fetch("/api/exams")
.then(res => res.json())
.then(exams => {

    let html = "";

    exams.forEach(exam => {

        html += `
        <div class="exam-card">

            <h2>${exam.name}</h2>

            <button
            class="test-btn"
            onclick="loadPapers(${exam.id})">

                View Test Series

            </button>

        </div>
        `;

    });

    document.getElementById("examList").innerHTML = html;

});
function loadPapers(examId){
    alert(

        "LOAD PAPERS: " +

        examId

    );
    console.log(
    "LOAD PAPERS FOR:",
    examId
);

    fetch("/api/papers/" + examId)

    .then(res => res.json())

    .then(papers => {

        let html = `

<h2 style="text-align:center;margin:20px">
Available Papers
</h2>

<div class="test-series-container">

`;

        papers.forEach(paper => {
            console.log(paper);

            html += `

<div class="test-box">
<div class="paper-header">

        <h3>${paper.paper_name}</h3>

        <span class="${

            paper.is_paid == 1

            ? "premium-badge"

            : "free-badge"

        }">

            ${

                paper.is_paid == 1

                ? "PREMIUM"

                : "FREE"

            }

        </span>

    </div>

    <h2>

        ${paper.name}

        ${paper.is_paid == 1 ?

        " 🔒 Premium" :

        " Free"}

    </h2>

    <br>

    <button
        class="test-btn"
        onclick="startTest(${paper.id})">

        Start Test

    </button>

</div>

`;

        });

        html += "</div>";

        document.getElementById("examList").innerHTML = html;

    });

}
