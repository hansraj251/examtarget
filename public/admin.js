console.log("ADMIN JS LOADED");
let editingDashboardContentId = null;
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

    showAdminLogin();

    return;

}

document.querySelector(

    ".sidebar"

).style.display =

"block";

showDashboard();

    }

);


function showPayments(){
     setActiveMenu(

        "menuPayments"

    );

    // document.getElementById(

    //     "pageTitle"

    // ).innerText =

    // "Payment History";

    fetch(

        "/api/payments"

    )

    .then(res => res.json())

    .then(payments => {

        let html = `

<div class="profile-card payment-container">

    <h2>

        💳 Payment History

    </h2>

    <table class="payment-table">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Amount</th>

                    <th>Plan</th>

                    <th>Status</th>

                    <th>Date</th>

                </tr>

            </thead>

            <tbody>

        `;

        payments.forEach(payment => {

            html += `

            <tr>

                <td>${payment.id}</td>

                <td>${payment.name}</td>

                <td>₹${payment.amount}</td>

                <td>${payment.plan_days} Days</td>

                <td>${payment.status}</td>

                <td>${payment.created_at}</td>

            </tr>

            `;

        });

        html += `

            </tbody>

        </table>

        `;

        document.getElementById(

            "content-area"

        ).innerHTML = html;

    });

}

function showDashboard(){
    setActiveMenu(

        "menuDashboard"

    );

fetch(
    "/api/admin-dashboard"
)

.then(
    res => res.json()
)

.then(data => {

// document.getElementById(
//     "pageTitle"
// ).innerText =
// "Dashboard";

document.getElementById(
    "content-area"
).innerHTML = `

<div class="stats">

    <div

    class="stat-card"

    onclick="showUsers()"

    style="cursor:pointer;"

>

        <h2>${data.users}</h2>

        <p>Total Users</p>

    </div>

    <div
class="stat-card clickable-card"
onclick="showAllExams()"
>

    <h2>${data.exams}</h2>

    <p>Total Exams</p>

</div>

    <div
    class="stat-card clickable-card"
    onclick="showAdminPapers()"
>

    <h2>${data.papers}</h2>

    <p>Total Papers</p>

</div>
<div
class="stat-card clickable-card"
onclick="showAllQuestions()"
style="cursor:pointer;"
>

    <h2>${data.questions}</h2>

    <p>Total Questions</p>

</div>

<div
class="stat-card clickable-card"
onclick="showDuplicateQuestions()"
style="cursor:pointer;"
>

    <h2>${data.duplicates || 0}</h2>

    <p>Duplicate Questions</p>

</div>


        <div class="stat-card"

onclick="showPayments()"

style="cursor:pointer;">

    <h2>

        ₹${data.revenue}

    </h2>

    <p>

        Total Revenue

    </p>

</div>
<div
class="stat-card"
onclick="showUsers()"
style="cursor:pointer;"
>

    <h2>${data.premiumUsers || 0}</h2>

    <p>Premium Users</p>

</div>

    </div>

</div>

`;

});

}
function showAllExams(){

    setActiveMenu("menuDashboard");

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <div class="papers-header">

        <input
            type="text"
            id="subtitleFilter"
            placeholder="Filter by subtitle..."
            onkeyup="filterExamsBySubtitle()"
        >

        <button
            class="danger-btn delete-exams-btn"
            onclick="deleteSelectedExams()"
        >
            Delete Selected
        </button>

    </div>

    <div id="exams">
        Loading...
    </div>

    `;

    loadExams();
}
function showAllQuestions(){

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <div class="profile-card">

        <input
        type="text"
        id="searchBox"
        placeholder="Search Questions"
        onkeyup="searchQuestions()">

        <select
        id="questionFilter"
        onchange="loadQuestionBank()">

            <option value="all">
                All Questions
            </option>

            <option value="unassigned">
                Unassigned Questions
            </option>

        </select>

        <button
        class="save-btn"
        onclick="deleteSelectedQuestions()">
        Delete Selected
        </button>
        <button
class="save-btn"
onclick="selectAllQuestions()">
Select All
</button>

        <br><br>

        <div id="questions">

            Loading...

        </div>

    </div>

    `;

    loadQuestionBank();

}
function selectAllQuestions(){

    document
    .querySelectorAll(
        ".questionCheck"
    )
    .forEach(cb => {

        cb.checked = true;

    });

}
function showAdminPapers(){
    const savedFilter =
localStorage.getItem(
    "paperExamFilter"
) || "all";

    fetch(
        "/api/admin/all-papers"
    )

    .then(res=>res.json())

    .then(papers=>{

        let html = `

<div class="papers-header">
<button
id="selectAllBtn"
class="save-btn"
onclick="selectAllPapers()">
Select All
</button>

<button
class="danger-btn"
onclick="deleteSelectedPapers()">
Delete Selected
</button>



    <select
id="paperExamFilter"
onchange="applyPaperFilters()">

    <option value="all">
        All Exams
    </option>

</select>

<input
type="text"
id="paperSubtitleFilter"
placeholder="Search subtitle..."
onkeyup="applyPaperFilters()">

</div>

<div
class="paper-grid"
>

`;

        papers.forEach(paper=>{

            html += `

<div

class="paper-card"

data-exam="${paper.exam_id}"

>
<input
type="checkbox"
class="paper-select"
value="${paper.id}">

<h3>

${paper.name}

</h3>

<p class="paper-subtitle">

    ${paper.subtitle || ""}

</p>

<p class="paper-language">

    🌐 ${paper.language || "English"}

</p>

<span class="${

paper.is_paid == 1

?

'paid-badge'

:

'free-badge'

}">

${

paper.is_paid == 1

?

'PAID'

:

'FREE'

}

</span>

<p>

<p class="paper-count">

📚 ${paper.total_questions} Questions

</p>
</p>
<div class="paper-actions">

<button
class="check-btn ${paper.is_checked ? 'checked-paper' : ''}"
onclick="checkPaper(${paper.id})"
>
${paper.is_checked ? 'Checked' : 'Check'}
</button>

<button
class="${
paper.is_hidden == 1
? 'show-btn'
: 'hide-btn'
}"
onclick="togglePaper(${paper.id})"
>

${paper.is_hidden == 1
? "Show"
: "Hide"}

</button>

<button
class="danger-btn"
onclick="deletePaperFromList(${paper.id})"
>
Delete
</button>

<button
class="${
paper.is_paid
? 'make-free-btn'
: 'make-paid-btn'
}"
onclick="
togglePaperStatus(
${paper.id},
${paper.is_paid}
)
"
>

${paper.is_paid ? "Make Free" : "Make Paid"}

</button>

</div>

</div>

`;

        });

        html += `

</div>

`;

        document.getElementById(
    "content-area"
).innerHTML = html;
const savedSubtitleFilter =

localStorage.getItem(

    "paperSubtitleFilter"

) || "";

const subtitleInput =

document.getElementById(

    "paperSubtitleFilter"

);

if(subtitleInput){

    subtitleInput.value =

    savedSubtitleFilter;

    applyPaperFilters();

}

loadExamFilter();

setTimeout(() => {

    const examFilter =
    document.getElementById(
        "paperExamFilter"
    );

    if(examFilter){

        examFilter.value =
        localStorage.getItem(
            "paperExamFilter"
        ) || "all";

    }

    const subtitleFilter =
    document.getElementById(
        "paperSubtitleFilter"
    );

    if(subtitleFilter){

        subtitleFilter.value =
        localStorage.getItem(
            "paperSubtitleFilter"
        ) || "";

    }

    applyPaperFilters();

},300);

    });

}
function applyPaperFilters(){

    const examId =
    document.getElementById(
        "paperExamFilter"
    )?.value || "all";

    const subtitle =
    document.getElementById(
        "paperSubtitleFilter"
    )?.value
    .toLowerCase()
    .trim() || "";

    localStorage.setItem(
        "paperExamFilter",
        examId
    );

    localStorage.setItem(
        "paperSubtitleFilter",
        subtitle
    );

    document
    .querySelectorAll(".paper-card")
    .forEach(card => {

        const examMatch =
        examId === "all" ||
        card.dataset.exam === examId;

        const subtitleMatch =
        card.querySelector(
            ".paper-subtitle"
        )?.textContent
        .toLowerCase()
        .includes(subtitle);

        card.style.display =
        (examMatch && subtitleMatch)
        ? "block"
        : "none";

    });

}

let currentPreviewPaperId = null;
let editSource = "";
function checkPaper(paperId){
  currentPreviewPaperId = paperId;
    fetch(
        "/api/admin/paper-preview/" +
        paperId
    )
    .then(res => res.json())
    .then(questions => {

        console.log(
            "Questions:",
            questions
        );

        let html = `
        <div class="preview-container">
        `;

        const grouped = {};

questions.forEach(q => {

    const section =
    q.section || "General";

    if(!grouped[section]){

        grouped[section] = [];

    }

    grouped[section].push(q);

});

html += `
<div
style="
    background:#f8fafc;
    border:1px solid #ddd;
    padding:15px;
    margin-bottom:20px;
    border-radius:8px;
"
>

<h2>
📊 Section Summary
</h2>

`;

let totalQuestions = 0;

Object.keys(grouped).forEach(section => {

    const count = grouped[section].length;

    totalQuestions += count;

    html += `
    <p>
        <strong>${section}</strong>
        : ${count} Questions
    </p>
    `;

});

html += `
<hr>

<p>
    <strong>
    Total Questions :
    ${totalQuestions}
    </strong>
</p>

</div>
`;

Object.keys(grouped).forEach(section => {

    html += `

    <h2
    style="
        margin:30px 0 15px 0;
        color:#2563eb;
    ">

        ${section}

    </h2>

    `;

    grouped[section].forEach((q,index) => {

        html += `

        <div class="preview-question">

            <h3>
    Q${index + 1}. ${q.question}
</h3>

            <p>A. ${q.optionA}</p>
            <p>B. ${q.optionB}</p>
            <p>C. ${q.optionC}</p>
            <p>D. ${q.optionD}</p>

            <div class="answer-box">

                Correct Answer :
                ${q.answer}

            </div>

        </div>

        <div class="question-actions">

            <button
            class="edit-btn"
            onclick="
            editSource='paper';
            currentPreviewPaperId=${paperId};
            editQuestion(${q.id})
            ">

                Edit

            </button>

            <button
            class="danger-btn"
            onclick="deleteQuestion(${q.id})">

                Delete

            </button>

        </div>

        `;

    });

});

       html += `

<div style="margin-top:20px;text-align:center;">

    <button
        class="save-btn"
        onclick="markPaperChecked()">

        OK

    </button>

</div>

</div>
`;

        document.getElementById(
            "content-area"
        ).innerHTML = html;

if(window.MathJax){

    MathJax.typesetPromise()

}

    });

}

async function markPaperChecked(){

    const res = await fetch(
        "/api/mark-paper-checked",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                paperId: currentPreviewPaperId
            })
        }
    );

    const data = await res.json();

    alert(data.message);

    showAdminPapers();
}
function togglePaperStatus(
paperId,
currentStatus
){

    const newStatus =

    currentStatus == 1

    ? 0

    : 1;

    fetch(

        "/api/admin/toggle-paper-status",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                paperId,

                isPaid:newStatus

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        if(data.success){

            showAdminPapers();

        }

    });

}
function togglePaper(id){

    fetch(

        "/api/toggle-paper",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                paperId:id

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        showAdminPapers();

    });

}
function loadExamFilter(){

    fetch(
        "/api/admin/exams"
    )

    .then(res=>res.json())

    .then(exams=>{

        const filter =

        document.getElementById(
            "paperExamFilter"
        );

        exams.forEach(exam=>{

            filter.innerHTML += `

<option value="${exam.id}">

${exam.name}

</option>

`;
const savedFilter =
localStorage.getItem(
    "paperExamFilter"
);

if(savedFilter){

    filter.value =
    savedFilter;

    filterAdminPapers();

}

        });

    });

}
function filterAdminPapers(){

    const examId =

    document.getElementById(
        "paperExamFilter"
    ).value;

    localStorage.setItem(

        "paperExamFilter",

        examId

    );

    document
    .querySelectorAll(
        ".paper-card"
    )
    .forEach(card=>{

        if(
            examId === "all"
        ){

            card.style.display =
            "block";

            return;

        }

        card.style.display =

        card.dataset.exam === examId

        ?

        "block"

        :

        "none";

    });

}
function showUsers(){

    // document.getElementById(

    //     "pageTitle"

    // ).innerText =

    // "Manage Users";



    fetch(

        "/api/users"

    )

    .then(res => res.json())

    .then(users => {

        let html = "";
        const admins = users.filter(

    user =>

    user.role === "admin"

);

const normalUsers = users.filter(

    user =>

    user.role !== "admin"

);

const premiumUsers = normalUsers.filter(
    user => user.subscription_type === "premium"
).length;

const freeUsers = normalUsers.filter(
    user => user.subscription_type !== "premium"
).length;

html += `

<div class="stats">

    <div class="stat-card">

        <h2>${premiumUsers}</h2>

        <p>Premium Users</p>

    </div>

    <div class="stat-card">

        <h2>${freeUsers}</h2>

        <p>Free Users</p>

    </div>

</div>

<br>

`;
html += `

<h2 style="margin-top:20px; margin-left:20px;">

    👑 Admin Accounts

</h2>

`;
admins.forEach(user => {

    html += `

    <div class="profile-card">

        <h3>

            Name: ${user.name}

        </h3>

        <p>

            Email: ${user.email}

        </p>

        <p>

            Role: ${user.role}

        </p>

    </div>

    `;

});
html += `
<br><br>
<hr>
<br><br>

<h2>

    👥 Users

</h2>

`;

        normalUsers.forEach(user => {

            let cardStyle = "";

            if(

                user.subscription_type ===

                "premium"

            ){

                cardStyle =

                "border:2px solid green;background:#f0fff0;";

            }

            html += `

            <div class="profile-card" style="${cardStyle}">

                <h3>
                Name: ${user.name}

                </h3>

                <p>
                Email: ${user.email}

                </p>

                <p>

                    Role:

                    ${user.role}

                </p>

                <p>

                    Plan:

                    ${user.subscription_type === "premium"

                    ? "🟢 Premium"

                    : "⚪ Free"}

                </p>

                <p>

                    Expiry:

                    ${user.premium_expiry || "N/A"}

                </p>
                <br><br>

                <input

                    type="number"

                    id="days${user.id}"
                    

                    placeholder="Days"

                    value="30"

                >
                

                <button

                    class="save-btn"

                    onclick="makePremiumCustom(${user.id})"

                >

                    Make Premium

                </button>

                <button

                    class="save-btn"

                    onclick="removePremium(${user.id})"

                >

                    Remove Premium

                </button>
                <button

    class="save-btn"

    onclick="deleteUser(${user.id})"

>

    Delete User

</button>


            </div>

            `;

        });

        document.getElementById(

            "content-area"

        ).innerHTML = html;

    });


}
function makePremium(

    userId,

    days

){

    fetch(

        "/api/make-premium",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                userId,

                days

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{


        showUsers();

    });

}
function showPremiumAdmin(){
    setActiveMenu(

        "menuPremium"

    );
    

    // document.getElementById(

    //     "pageTitle"

    // ).innerText =

    // "Premium Plans";

    document.getElementById(

        "content-area"

    ).innerHTML = `

    <div class="profile-card">

        <input

            id="planName"

            placeholder="Plan Name"

        >

        <br><br>

        <input

            id="planDays"

            type="number"

            placeholder="Days"

        >

        <br><br>

        <input

            id="planPrice"

            type="number"

            placeholder="Price"

        >

        <br><br>

        <button

            class="save-btn"

            onclick="addPremiumPlan()"

        >

            Add Plan

        </button>

        <hr

        style="margin:25px 0;">

        <div

            id="premiumPlansList"

        >

            Loading...

        </div>

    </div>

    `;

    loadPremiumPlans();

}
function loadPremiumPlans(){

    fetch(

        "/api/premium-plans"

    )

    .then(

        res => res.json()

    )

    .then(

        plans => {

            let html = "";

            plans.forEach(plan => {

                html += `

                <div class="exam-item">

                    <div>

                        <b>

                            ${plan.plan_name}

                        </b>

                        <br>

                        ${plan.days}

                        Days

                        |

                        ₹${plan.price}

                    </div>

                    <button

                        class="save-btn"

                        onclick="deletePremiumPlan(

                            ${plan.id}

                        )"

                    >

                        Delete

                    </button>

                </div>

                `;

            });

            document.getElementById(

                "premiumPlansList"

            ).innerHTML = html;

        }

    );

}
function addPremiumPlan(){

    fetch(

        "/api/add-premium-plan",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                plan_name:

                document.getElementById(

                    "planName"

                ).value,

                days:Number(

                    document.getElementById(

                        "planDays"

                    ).value

                ),

                price:Number(

                    document.getElementById(

                        "planPrice"

                    ).value

                )

            })

        }

    )

    .then(

        res => res.json()

    )

    .then(

        data => {


            loadPremiumPlans();

        }

    );

}
function deletePremiumPlan(id){

    if(

        !confirm(

            "Delete Plan?"

        )

    ){

        return;

    }

    fetch(

        "/api/delete-premium-plan",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                id

            })

        }

    )

    .then(

        res => res.json()

    )

    .then(

        data => {


            loadPremiumPlans();

        }

    );

}
function actualDeleteUser(userId){

    fetch(

        "/api/delete-user",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                userId

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        console.log(
            data.message
        );

        showUsers();

    });

}
function deleteUser(userId){

    showConfirmModal(

        "Delete User",

        "Delete this user permanently?",

        function(){

            actualDeleteUser(

                userId

            );

        }

    );

}
function makePremiumCustom(userId){

    const days =

    Number(

        document.getElementById(

            "days" + userId

        ).value

    );

    if(

        days <= 0

    ){

        alert(

            "Enter valid days"

        );

        return;

    }

    makePremium(

        userId,

        days

    );

}
function removePremium(userId){

    fetch(

        "/api/remove-premium",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                userId

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(

            data.message

        );

        showUsers();

    });

}

function logout(){

    fetch(

        "/api/logout",

        {

            method:"POST"

        }

    )

    .then(

        () => {

            localStorage.clear();
showAdminLogin();

        }

    );

}
function showAddTypingTest(){

    setActiveMenu(
        "menuAddTyping"
    );

    // document.getElementById(
    //     "pageTitle"
    // ).innerText =
    // "Add Typing Test";

    document.getElementById(
        "content-area"
    ).innerHTML = `

<div class="profile-card">

<input
    type="text"
    id="typingTitle"
    placeholder="Title"
>

<br><br>

<select id="typingCategory">

    <option value="easy">
        Easy
    </option>

    <option value="normal">
        Normal
    </option>

    <option value="hard">
        Hard
    </option>

</select>

<br><br>

<textarea
    id="typingPassage"
    rows="12"
    placeholder="Typing Passage"
></textarea>

<br><br>

<button
    class="save-btn"
    onclick="addTypingTest()"
>

    Save Passage

</button>
<br><br>
<hr>

<h2>
Manage Passages
</h2>

<div id="typingTests">

Loading...

</div>

</div>

`;

    loadTypingTests();

}
function addTypingTest(){

    fetch(

        "/api/add-typing-test",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                title:

                document.getElementById(
                    "typingTitle"
                ).value,

                category:

                document.getElementById(
                    "typingCategory"
                ).value,

                duration_minutes:0,

                passage:

                document.getElementById(
                    "typingPassage"
                ).value

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(
            data.message
        );

        loadTypingTests();

    });

}
function loadTypingTests(){

    fetch(
        "/api/typing-tests"
    )

    .then(res=>res.json())

    .then(rows=>{

        let html = "";

        rows.forEach(row=>{

            html += `

<div class="test-box">

<h3>

${row.title}

</h3>

<p>

Category:
${row.category}

</p>

<br><br>
<button

    class="danger-btn"

    onclick="deleteTypingTest(
        ${row.id}
    )"

>

Delete

</button>

</div>

`;

        });

        document.getElementById(
            "typingTests"
        ).innerHTML =
        html;

    });

}
function deleteTypingTest(id){

    if(

        !confirm(

            "Delete this passage?"

        )

    ){

        return;

    }

    fetch(

        "/api/delete-typing-test",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                id

            })

        }

    )

    .then(res => res.json())

    .then(data => {

        alert(

            data.message

        );

        loadTypingTests();

    });

}

function showAddExam(){
    setActiveMenu(

    "menuAddExam"

);

// document.getElementById(
//     "pageTitle"
// ).innerText =
// "Add Exam";

document.getElementById(
    "content-area"
).innerHTML = `

<div class="profile-card">

    <input
    type="text"
    id="examName"
    placeholder="Exam Name">

<br><br>
<input
    type="text"
    id="examSubtitle"
    placeholder="Exam Subtitle">

<br><br>

<select id="logoId">

</select>

<br><br>

<button
        class="save-btn"
        onclick="addExam()">

        Add Exam

    </button>


`;
fetch(
"/api/exam-logos"
)

.then(
res=>res.json()
)

.then(logos=>{

let html = "";

logos.forEach(logo=>{

html += `

<option
value="${logo.id}"
>

${logo.name}

</option>

`;

});

document
.getElementById(
"logoId"
)
.innerHTML =
html;

});

}

function showAddPaper(){
    setActiveMenu(
    "menuAddPaper"
);

// document.getElementById(
//     "pageTitle"
// ).innerText =
// "Add Paper";

document.getElementById(
    "content-area"
).innerHTML = `

<div class="profile-card">

    <select id="examSelect"></select>

    <input
    type="text"
    id="paperName"
    placeholder="Paper Name">

<input
    type="text"
    id="paperSubtitle"
    placeholder="Paper Subtitle">

<input
type="text"
id="paperCode"
placeholder="Paper Code">

<select id="paperLanguage">

    <option value="English">
        English
    </option>

    <option value="Hindi">
        Hindi
    </option>

</select>

<br><br>

    <button
        class="save-btn"
        onclick="addPaper()">

        Add Paper

    </button>

    <hr style="margin:30px 0;">

    <h2>Paper Settings</h2>
   <select id="paperSettingsExamFilter">
    <option value="">
        Select Exam
    </option>
</select>

<br><br>

<select id="paperSubtitleFilter">

    <option value="">
        All Subtitles
    </option>

</select>

<br><br>

<select id="paperSelect">
</select>

    <br><br>

    <input
        id="positiveMarks"
        placeholder="Positive Marks">

    <br><br>

    <input
        id="negativeMarks"
        placeholder="Negative Marks">

    <br><br>

    <div id="sectionTimes">
    </div>

    <br>

    <select id="navigation">

        <option value="free">
            Free Navigation
        </option>

        <option value="locked">
            Locked Navigation
        </option>

    </select>

    <br><br>
    <label>
    Timer Type
</label>

<select id="timerType">

    <option value="total">
        Total Duration
    </option>

    <option value="section">
        Section Wise Timer
    </option>

</select>

<br><br>

    <input
        id="duration"
        placeholder="Duration Minutes">

    <br><br>

    <button
        class="save-btn"
        onclick="savePaperSettings()">

        Save Settings

    </button>

</div>

`;

loadExamDropdown();

loadPaperSettings();

}

function setActiveMenu(menuId){

    document
    .querySelectorAll(
        ".sidebar-menu li"
    )
    .forEach(li => {

        li.classList.remove(
            "active"
        );

    });

    document
    .getElementById(menuId)
    .classList.add(
        "active"
    );

}
function showAddQuestion(){

    setActiveMenu(
        "menuAddQuestion"
    );

    // document.getElementById(
    //     "pageTitle"
    // ).innerText =
    // "Add Question";

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <div class="profile-card">
        
        <br><br>

        <h3>Import Questions</h3>

        <input
        type="file"
        id="excelFile"
        accept=".xlsx,.xls">

        <button
        class="save-btn"
        onclick="uploadExcel()">

        Import Excel

        </button>
       <input
type="file"
id="jsonFile"
accept=".json">

<button
class="save-btn"
onclick="uploadJsonQuestions()">
Import JSON
</button>
        <br><br>
       
        
    </div>

    `;

}
function showAdminLogin(){

    document.querySelector(
        ".sidebar"
    ).style.display = "none";

    // document.getElementById(
    //     "pageTitle"
    // ).innerText = "Admin Login";

    document.getElementById(
        "content-area"
    ).innerHTML = `

        <div class="profile-card">

        <h2> Admin Login </h2>

            <input
id="email"
placeholder="Email">

            <br><br>

            <input
            type="password"
            id="password"
            placeholder="Password">

            <br><br>

            <button
            class="save-btn"
            onclick="adminLogin()">

            Login

            </button>

        </div>

    `;
}
function adminLogin(){

    fetch(

        "/api/login",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                email:

                document.getElementById(

                    "email"

                ).value,

                password:

                document.getElementById(

                    "password"

                ).value

            })

        }

    )

    .then(res => res.json())

    .then(data => {

        if(

            data.message ===

            "Login Successful"

        ){
            if(

    data.role !==

    "admin"

){

    alert(

        "Access Denied"

    );

    return;

}

            document.querySelector(

                ".sidebar"

            ).style.display =

            "block";

            showDashboard();

        }

        else{

            alert(

                data.message

            );

        }

    });

}
function toggleAdminMenu(){

    document.getElementById(

        "adminDropdown"

    ).classList.toggle(

        "show"

    );

}
function goToUserPanel(){

    window.location.href =

    "home.html";

}
console.log(
    "ADMIN JS LOADED"
);
function showAdminWelcome(){

    document.getElementById(

        "pageTitle"

    ).innerText =

    "Welcome";

    document.getElementById(

        "content-area"

    ).innerHTML = `

    <div class="profile-card">

        <h2>

            Welcome Admin

        </h2>

        <br>

        <button

        class="save-btn"

        onclick="showDashboard()">

        Continue

        </button>

    </div>

    `;

}
function editDashboardContent(id){

    alert(
        "Edit coming next"
    );

}
function loadDashboardContent(){

    fetch(
    "/api/admin-dashboard-content"
)

    .then(res => res.json())

    .then(rows => {

        let html = "";

        rows.forEach(row => {

            html += `

<div class="note-card">

<h3>

${row.title}

</h3>

<p>

${row.content}

</p>

<p>

Status:

${
row.is_active == 1

?

"🟢 Active"

:

"🔴 Inactive"

}

</p>

<button
onclick="editDashboardContent(

${row.id}

)"
>

✏️ Edit

</button>

<button
onclick="deleteDashboardContent(

${row.id}

)"
>

🗑 Delete

</button>

<button
onclick="toggleDashboardContent(

${row.id},

${row.is_active}

)"
>

${
row.is_active == 1

?

"Hide"

:

"Show"

}

</button>

</div>

`;

        });

        document.getElementById(
            "dashboardContentList"
        ).innerHTML = html;

    });

}
function deleteDashboardContent(id){

    if(

        !confirm(

            "Delete Content?"

        )

    ){

        return;

    }

    fetch(

        "/api/delete-dashboard-content",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                id

            })

        }

    )

    .then(res=>res.json())

    .then(()=>{

        loadDashboardContent();

    });

}
function toggleDashboardContent(

id,

currentStatus

){

    fetch(

        "/api/toggle-dashboard-content",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                id,

                is_active:

                currentStatus == 1

                ? 0

                : 1

            })

        }

    )

    .then(res=>res.json())

    .then(()=>{

        loadDashboardContent();

    });

}

function showDashboardContent(){

    setActiveMenu(
        "menuDashboardContent"
    );

    // document.getElementById(
    //     "pageTitle"
    // ).innerText =
    // "Dashboard Content";

    document.getElementById(
        "content-area"
    ).innerHTML = `

<div class="profile-card">

<select id="contentType">

    <option value="banner">

        Featured Banner

    </option>

    <option value="notice">

        Notice

    </option>

</select>

<br><br>

<input
id="dashboardTitle"
placeholder="Title"
>

<br><br>

<textarea
id="dashboardContent"
placeholder="Content"
></textarea>

<br><br>

<input
id="dashboardButtonText"
placeholder="Button Text"
>

<br><br>

<input
id="dashboardButtonLink"
placeholder="Button Link"
>

<br><br>
<br><br>

<input
type="file"
id="dashboardImage"
accept="image/*"
>

<br><br>

<input
id="dashboardOrder"
type="number"
placeholder="Display Order"
value="0"
>



<button
id="dashboardSaveBtn"
class="save-btn"
onclick="saveDashboardContent()"
>
Save Content
</button>
<br><br>
<hr>
<br><br>
<div
id="dashboardContentList"
>

</div>

</div>

`;

    loadDashboardContent();

}
function saveDashboardContent(){
    const imageFile =

document.getElementById(
    "dashboardImage"
).files[0];
if(imageFile){

    const formData =
    new FormData();

    formData.append(
        "image",
        imageFile
    );

    fetch(

        "/api/upload-dashboard-image",

        {

            method:"POST",

            body:formData

        }

    )

    .then(res=>res.json())

    .then(img=>{

    console.log(
        "UPLOAD RESPONSE",
        img
    );

    saveDashboardContentData(

        img.image_url

    );

});

    return;

}
    if(

    editingDashboardContentId

){

    fetch(

        "/api/update-dashboard-content",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                id:

                editingDashboardContentId,

                title:

                document.getElementById(
                    "dashboardTitle"
                ).value,

                content:

                document.getElementById(
                    "dashboardContent"
                ).value,

                button_text:

                document.getElementById(
                    "dashboardButtonText"
                ).value,

                button_link:

                document.getElementById(
                    "dashboardButtonLink"
                ).value,

                sort_order:

                document.getElementById(
                    "dashboardOrder"
                ).value

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(
            data.message
        );

        editingDashboardContentId =
        null;

        showDashboardContent();

    });

    return;

}

    fetch(

        "/api/dashboard-content",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                title:

                document.getElementById(
                    "dashboardTitle"
                ).value,

                content:

                document.getElementById(
                    "dashboardContent"
                ).value,

                button_text:

                document.getElementById(
                    "dashboardButtonText"
                ).value,

                button_link:

                document.getElementById(
                    "dashboardButtonLink"
                ).value,

                sort_order:

                document.getElementById(
                    "dashboardOrder"
                ).value

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(
            data.message
        );

        showDashboardContent();

    });

}
function saveDashboardContentData(

imageUrl = ""

){
    console.log({

    title:
    document.getElementById(
        "dashboardTitle"
    ).value,

    image_url:
    imageUrl

});

    fetch(

        "/api/dashboard-content",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                title:

                document.getElementById(
                    "dashboardTitle"
                ).value,

                content:

                document.getElementById(
                    "dashboardContent"
                ).value,
                content_type:

document.getElementById(
    "contentType"
).value,

                button_text:

                document.getElementById(
                    "dashboardButtonText"
                ).value,

                button_link:

                document.getElementById(
                    "dashboardButtonLink"
                ).value,

                sort_order:

                document.getElementById(
                    "dashboardOrder"
                ).value,

                image_url:

                imageUrl

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(
            data.message
        );

        showDashboardContent();

    });

}
function editDashboardContent(id){

    fetch(
        "/api/admin-dashboard-content"
    )

    .then(res => res.json())

    .then(rows => {

        const item =

        rows.find(
            row => row.id == id
        );

        if(!item){
            return;
        }

        editingDashboardContentId =
        id;

        document.getElementById(
            "dashboardTitle"
        ).value =
        item.title || "";

        document.getElementById(
            "dashboardContent"
        ).value =
        item.content || "";

        document.getElementById(
            "dashboardButtonText"
        ).value =
        item.button_text || "";

        document.getElementById(
            "dashboardButtonLink"
        ).value =
        item.button_link || "";

        document.getElementById(
            "dashboardOrder"
        ).value =
        item.sort_order || 0;

        document.getElementById(
            "dashboardSaveBtn"
        ).innerText =
        "Update Content";

    });

}



let confirmAction = null;
function runConfirmAction(){

    if(confirmAction){

        confirmAction();

    }

    closeConfirmModal();

}
function closeConfirmModal(){

    document.getElementById(
        "confirmModal"
    ).style.display = "none";

}
function showConfirmModal(

    title,

    message,

    action

){

    document.getElementById(
        "confirmTitle"
    ).innerText = title;

    document.getElementById(
        "confirmMessage"
    ).innerText = message;

    confirmAction = action;

    document.getElementById(
        "confirmModal"
    ).style.display = "flex";

}
console.log(
    "RUN CONFIRM TYPE:",
    typeof runConfirmAction
);

function deletePaperFromList(paperId){

    showConfirmModal(
        "Delete Paper",
        "Delete this paper permanently?",
        function(){

            actualDeletePaper(
                paperId
            );

        }
    );

}
function showDuplicateQuestions(){
 console.log("DUPLICATE PAGE OPENED");
    fetch(
        "/api/duplicate-questions"
    )

    .then(res=>res.json())

    .then(rows=>{
        let html = `

<div style="margin-bottom:20px;">
<button
class="save-btn"
onclick="assignAllDuplicates()">

    Assign All Duplicates

</button>

    <button
    class="danger-btn"
    onclick="clearAllDuplicates()">

        Clear All Duplicates

    </button>

</div>

`;

        rows.forEach(r=>{ console.log(r);
            

            html += `
            

<div class="profile-card">


    <p>
    Existing ID:
    ${r.existing_question_id}
    </p>

    <p>
    Existing Paper:
    ${r.existing_paper_code}
    </p>

    <p>
    New Paper:
    ${r.duplicate_paper_code}
    </p>

    <p>
    ${r.question}
    </p>

    <button
    class="save-btn"
    onclick="
assignDuplicateQuestion(
    ${r.id},
    ${r.existing_question_id},
    ${r.target_paper_id}
)
">
        Assign Existing Question
    </button>

</div>


`;

        });
        

        document.getElementById(
            "content-area"
        ).innerHTML = html;

    });
    
    

}
async function assignAllDuplicates(){

    if(
        !confirm(
            "Assign all duplicate questions?"
        )
    ){
        return;
    }

    const res = await fetch(
        "/api/assign-all-duplicates",
        {
            method:"POST"
        }
    );

    const data =
    await res.json();

    alert(data.message);

    showDuplicateQuestions();

}
async function assignDuplicateQuestion(
    duplicateId,
    questionId,
    paperId
){
     console.log(

        "duplicateId:",

        duplicateId

    );

    console.log(

        "questionId:",

        questionId

    );

    console.log(

        "paperId:",

        paperId

    );

    const res = await fetch(
        "/api/assign-duplicate-question",
        {
            method:"POST",
            headers:{
                "Content-Type":
                "application/json"
            },
            body:JSON.stringify({

    duplicateId,

    questionId,

    paperId

})
        }
    );

    const data =
    await res.json();

    alert(
        data.success
        ?
        "Assigned"
        :
        "Error"
    );

}
async function clearAllDuplicates(){

    if(
        !confirm(
            "Clear all duplicate records?"
        )
    ){
        return;
    }

    const res = await fetch(
        "/api/clear-all-duplicates",
        {
            method:"POST"
        }
    );

    const data = await res.json();

    alert(data.message);

    showDuplicateQuestions();

}


function showPaperGenerator(){

    setActiveMenu(
        "menuPaperGenerator"
    );

    document.getElementById(
        "content-area"
    ).innerHTML = `

<h2>
Paper Generator
</h2>

<label>
Start Date
</label>

<input
type="date"
id="startDate">

<label>
End Date
</label>

<input
type="date"
id="endDate">

<label>
Exam
</label>

<select
id="examId">
</select>

<label>
Paper Name
</label>

<input
type="text"
id="paperName"
placeholder=" Enter Paper Name ">

<label>
Language
</label>

<select id="language">

    <option value="English">
        English
    </option>

    <option value="Hindi">
        Hindi
    </option>

</select>
<label>
Total Mocks
</label>

<input
type="number"
id="mockCount"
value="3"
min="1"
max="10">

<button
class="save-btn"
onclick="
generatePapers()
">

Generate Papers

</button>

`;
fetch(
    "/api/exams"
)
.then(
    res=>res.json()
)
.then(exams=>{

    let html = "";

    exams.forEach(exam=>{

        html += `

<option
value="${exam.id}">
${exam.name}
</option>

`;

    });

    document.getElementById(
        "examId"
    ).innerHTML = html;

});

}
async function generatePapers(){

    const startDate =
    document.getElementById(
        "startDate"
    ).value;

    const endDate =
    document.getElementById(
        "endDate"
    ).value;

    const examId =
    document.getElementById(
        "examId"
    ).value;
    const language =
document.getElementById(
    "language"
).value;
const mockCount =
document.getElementById(
    "mockCount"
).value;
const paperName =
document.getElementById(
    "paperName"
).value;

    const res =
    await fetch(
        "/api/generate-papers",
        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

           body:
JSON.stringify({

    startDate,

    endDate,

    examId,

    language,

    mockCount,

    paperName

})

        }
    );

    const data =
    await res.json();

    alert(
        data.message
    );

}
function selectAllPapers(){

    const visibleCards =

document.querySelectorAll(

'.paper-card:not([style*="display: none"])'

);

const checkboxes =

[
...document.querySelectorAll(
".paper-card .paper-select"
)
]

.filter(cb =>

cb.closest(".paper-card")
.offsetParent !== null

);

const allChecked =

checkboxes.every(
cb => cb.checked
);

checkboxes.forEach(cb=>{

cb.checked = !allChecked;

});

document.getElementById(
"selectAllBtn"
).textContent =

allChecked

? "Select All"

: "Unselect All";

}
async function deleteSelectedPapers(){
    

const ids =

[
...document.querySelectorAll(
".paper-select:checked"
)
]
.filter(cb =>

cb.closest(".paper-card")

.offsetParent !== null

)

.map(cb=>cb.value);

if(ids.length === 0){

alert(
"Select papers first"
);

return;

}

if(
!confirm(
`Delete ${ids.length} papers?`
)
){

return;

}

const res =
await fetch(
"/api/delete-papers",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({
ids
})

}

);

const data =
await res.json();

alert(
data.message
);

showAdminPapers();

}

function showLogoManager(){

    document.getElementById(
        "content-area"
    ).innerHTML = `

<input
type="text"
id="logoName"
placeholder="Logo Name">

<br><br>

<input
type="file"
id="logoFile">

<br><br>

<button
class="save-btn"
onclick="addLogo()">

Upload Logo

</button>

<br><br>

<div id="logoList">

Loading...

</div>

`;

    loadLogos();

}
function addLogo(){

const name =
document.getElementById(
    "logoName"
).value;

const file =
document.getElementById(
    "logoFile"
).files[0];

if(!name || !file){

    alert(
        "Enter name and select file"
    );

    return;

}

const fd =
new FormData();

fd.append(
    "name",
    name
);

fd.append(
    "logo",
    file
);

fetch(

"/api/add-logo",

{

method:"POST",

body:fd

}

)

.then(
r=>r.json()
)

.then(data=>{

    alert(
        "Logo Added"
    );

    loadLogos();

});

}
function loadLogos(){

fetch(
"/api/exam-logos"
)

.then(
r=>r.json()
)

.then(logos=>{

let html = "";

logos.forEach(logo=>{

html += `

<div
class="logo-card">

<img
src="/uploads/${logo.image_file}"
width="80">

<p>

${logo.name}

</p>
 <button

    class="danger-btn"

    onclick="deleteLogo(${logo.id})">

    Delete

    </button>

</div>

`;

});

document.getElementById(
"logoList"
).innerHTML = html;

});

}
function deleteLogo(id){

    if(
        !confirm(
            "Delete this logo?"
        )
    ){
        return;
    }

    fetch(

        "/api/delete-logo/" + id,

        {
            method:"DELETE"
        }

    )

    .then(
        r=>r.json()
    )

    .then(data=>{

        alert(
            data.message
        );

        loadLogos();

    });

}
async function uploadJsonQuestions(){

    try{

        const file =
        document.getElementById(
            "jsonFile"
        ).files[0];

        if(!file){

            alert(
                "Select JSON file"
            );

            return;

        }

        const formData =
        new FormData();

        formData.append(
            "file",
            file
        );

        const res =
        await fetch(
            "/api/import-json",
            {
                method:"POST",
                body:formData
            }
        );

        const responseText =
        await res.text();

        console.log(
            "SERVER RESPONSE:"
        );

        console.log(
            responseText
        );

        if(!res.ok){

            alert(
                "Server Error:\n\n" +
                responseText
            );

            return;

        }

        try{

            const data =
            JSON.parse(
                responseText
            );

            alert(

                data.message ||

                `Imported Successfully`

            );

        }
        catch(parseError){

            alert(
                "Invalid JSON Response:\n\n" +
                responseText
            );

        }

    }
    catch(err){

        console.error(err);

        alert(
            "Upload Failed:\n\n" +
            err.message
        );

    }

}
function downloadBackup(){

    window.location.href =
    "/api/download-backup";

}
function downloadBackup(){

    window.open(
        "/api/download-backup",
        "_blank"
    );

}
function exportUsers(){

    window.open(
        "/api/export-users",
        "_blank"
    );

}

function exportPayments(){

    window.open(
        "/api/export-payments",
        "_blank"
    );

}
function showSiteStats(){

    fetch("/api/admin-stats")

    .then(res => res.json())

    .then(data => {

        document.getElementById(
            "content-area"
        ).innerHTML = `

        <h2>📈 Site Statistics</h2>

        <div style="
            display:grid;
            grid-template-columns:
            repeat(auto-fit,minmax(220px,1fr));
            gap:15px;
            margin-top:20px;
        ">

            <div class="stat-card">
                <h3>Total Users</h3>
                <h1>${data.totalUsers}</h1>
            </div>

            <div class="stat-card">
                <h3>Premium Users</h3>
                <h1>${data.premiumUsers}</h1>
            </div>

            <div class="stat-card">
                <h3>Free Users</h3>
                <h1>${data.freeUsers}</h1>
            </div>

            <div class="stat-card">
                <h3>Total Payments</h3>
                <h1>${data.totalPayments}</h1>
            </div>

            <div class="stat-card">
                <h3>Revenue</h3>
                <h1>₹${data.revenue}</h1>
            </div>

        </div>

        `;

    });

}
function showRestoreBackup(){

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <h2>♻️ Restore Backup</h2>

    <p>
        Select a database backup (.db) file.
    </p>

    <input
        type="file"
        id="backupFile"
        accept=".db"
    >

    <br><br>

    <button
        onclick="restoreBackup()"
    >
        Restore Backup
    </button>

    `;

}
async function restoreBackup(){

    const file = document.getElementById(
        "backupFile"
    ).files[0];

    if(!file){

        alert(
            "Please select a backup file"
        );

        return;

    }

    const formData =
    new FormData();

    formData.append(
        "backup",
        file
    );

    const res = await fetch(

        "/api/restore-backup",

        {
            method:"POST",
            body:formData
        }

    );

    const data =
    await res.json();

    alert(
        data.message
    );

}