// Session Check
let selectedNotes = [];
let notesData = [];
let editingNoteId = null;
let deletingNoteId = null;
let typingDuration = 0;
let typingCategory = "";
let highlightEnabled = true;
let typingStarted = false;
let bookmarkedQuestions = [];
async function isLoggedIn(){

    const res = await fetch(
        "/api/check-session"
    );

    const data = await res.json();

    return !!data.userId;

}
fetch("/api/check-session")
.then(res => res.json())
.then(data => {
    

    const dropdown =
    document.querySelector(".profile-dropdown");
    const authMenu =
document.getElementById("authMenu");

    if(!dropdown) return;

    if(data.userId){

        dropdown.innerHTML = `

<a href="settings.html">Settings</a>

<a href="account.html">Account</a>

<a href="#" onclick="logout()">Logout</a>

`;
if(authMenu){

    authMenu.innerHTML =
    "🚪 Logout";

    authMenu.onclick = logout;

}

    }else{

        dropdown.innerHTML = `

<a href="login.html">Login</a>

<a href="register.html">Register</a>

`;
if(authMenu){

    authMenu.innerHTML =
    "🔑 Login";

    authMenu.onclick = showLogin;

}

    }

});


// Logout

function logout(){
    exitExamMode();

    fetch("/api/logout",{
        method:"POST"
    })

    .then(res => res.json())

    .then(() => {
        

        localStorage.removeItem("loggedIn");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        location.reload();

    });

}


// Profile Menu

function toggleMenu(){

    const menu =
    document.querySelector(".profile-dropdown");

    if(menu){
        menu.classList.toggle("show-menu");
    }

}

document.addEventListener("click",function(event){

    const menu =
    document.querySelector(".profile-menu");

    const dropdown =
    document.querySelector(".profile-dropdown");

    if(!menu || !dropdown) return;

    if(!menu.contains(event.target)){

        dropdown.classList.remove("show-menu");

    }

});

// =========================
// Dashboard
// =========================

function showDashboard(){
    setActiveMenu(

        "menuDashboard"

    );
    exitExamMode();

    fetch(
        "/api/dashboard-content"
    )

    .then(res=>res.json())

    .then(rows=>{

        const banners =

rows.filter(
    row =>

    row.content_type ===
    "banner"

    ||

    !row.content_type
);

const notices =

rows.filter(
    row =>

    row.content_type ===
    "notice"
);

        let html = "";

        // Slider

        if(
            banners.length > 0
        ){

            html += `

<div class="swiper mySwiper">

    <div class="swiper-wrapper">

        ${banners.map(
            banner => `
            <div class="swiper-slide">

                <a
                href="${banner.button_link || '#'}"
                class="slider-link"
                >

                    <img
                    src="${banner.image_url}"
                    class="slider-image"
                    >

                    <div class="slider-overlay">

                        <h2>
                            ${banner.title || ""}
                        </h2>

                        <p>
                            ${banner.content || ""}
                        </p>

                    </div>

                </a>

            </div>
            `
        ).join("")}

    </div>

    <div class="swiper-button-next"></div>

    <div class="swiper-button-prev"></div>

    <div class="swiper-pagination"></div>

</div>

`;
        }
        if(
    notices.length > 0
){

    html += `

    <div class="dashboard-section">

        <h2>

            📢 Notices

        </h2>

    `;

    notices.forEach(item=>{

        html += `

        <div class="notice-card">

            <h3>

                ${item.title}

            </h3>

            <p>

                ${item.content}

            </p>

        </div>

        `;

    });

    html += `
    

    </div>

    `;
    

}
html += `

<div class="activity-section">

    <div
    id="activityContainer"
    class="activity-grid"
    >

    </div>

</div>

`;
        // Cards

        rows.forEach(row=>{

    if(
        row.content_type ===
        "banner"

        ||

        row.content_type ===
        "notice"
    ){

        return;
    }

            html += `
            

            <div class="dashboard-card">

                <h2>

                ${row.title}

                </h2>

                <p>

                ${row.content}

                </p>

                ${
                row.button_text

                ?

                `<a
                href="${row.button_link}"
                class="test-btn"
                >

                ${row.button_text}

                </a>`

                :

                ""

                }

            </div>

            `;

        });

        document.getElementById(
            "content-area"
        ).innerHTML = html;
        const userId =

localStorage.getItem(
    "userId"
);

if(userId){

fetch(

    "/api/my-attempts/" +

    userId

)

.then(res => res.json())

.then(data => {

    const totalAttempts =
    data.length;

    let topScore = 0;

    data.forEach(attempt=>{

        const score =

        Number(
            attempt.score
        ) || 0;

        if(
            score > topScore
        ){

            topScore =
            score;

        }

    });

    document.getElementById(

        "activityContainer"

    ).innerHTML =

    `

    <div class="activity-card">

        <h3>

        ${totalAttempts}

        </h3>

        <p>

        Total Attempts

        </p>

    </div>

    <div class="activity-card">

        <h3>

        ${topScore}

        </h3>

        <p>

        Top Score

        </p>

    </div>

    `;

});

}

        setTimeout(()=>{

            new Swiper(

                ".mySwiper",

                {

                    loop:true,

                    autoplay:{

                        delay:5000,

                        disableOnInteraction:false

                    },

                    navigation:{

                        nextEl:
                        ".swiper-button-next",

                        prevEl:
                        ".swiper-button-prev"

                    },

                    pagination:{

                        el:
                        ".swiper-pagination",

                        clickable:true

                    }

                }

            );

        },100);

    });
    

}
function showLatestTests(){

    setActiveMenu(
        "menuLatestTests"
    );

    fetch(
        "/api/latest-tests"
    )

    .then(res=>res.json())

    .then(tests=>{

        let html = `

        <div
        class="latest-tests-grid"
        >

        `;

        tests.forEach(test=>{

           html += `

<div class="latest-test-card">

    <span class="${
    test.is_paid == 1
    ? 'paid-badge'
    : 'free-badge'
    } paper-badge">

    ${
    test.is_paid == 1
    ? 'PAID'
    : 'FREE'
    }

    </span>

    <h3>
        ${test.name}
    </h3>

    <p class="paper-subtitle">
        ${test.subtitle || ""}
    </p>

    <p>
        🌐 ${test.language || "English"}
    </p>

    <button
        class="test-btn"
        onclick="startTest(${test.id})"
    >
        Start Test
    </button>

</div>

`;

        });

        html += `

        </div>

        `;

        document.getElementById(
            "content-area"
        ).innerHTML = html;

    });

}

function showMyAttempts(){
    setActiveMenu(

        "menuAttempts"

    );

    const userId =
    localStorage.getItem("userId");

    if(!userId){

        showLogin();
        return;

    }

    fetch(
        "/api/my-attempts/" + userId
    )

    .then(res => res.json())

    .then(data => {

        let html = `


        `;

        if(data.length === 0){

            html += `

            <p>No Attempts Found</p>

            `;

        }

        data.forEach(attempt => {
            console.log(

        "RAW DATE:",

        attempt.created_at

    );

            html += `

            <div class="test-box">

                <h3>

                    ${attempt.paper_name}

                </h3>

                <p>

                    Score :
                    ${attempt.score}

                </p>

                <p>

                    Correct :
                    ${attempt.correct}

                </p>

                <p>

                    Wrong :
                    ${attempt.wrong}

                </p>

                <p>

    Date :
    ${
        new Date(
            attempt.created_at + "Z"
        ).toLocaleString(
            "en-IN",
            {
                timeZone:
                "Asia/Kolkata"
            }
        )
    }

</p>
<button
class="test-btn"
onclick="viewAttemptResult(
${attempt.id}
)"

>

View Result

</button>

            </div>
            

            <br>

            `;

        });

        document.getElementById(
            "content-area"
        ).innerHTML = html;

    });

}

function saveNote(){

    const userId =
    localStorage.getItem("userId");

    const subject =
    document.getElementById(
        "subject"
    ).value;

    const title =
    document.getElementById(
        "noteTitle"
    ).value;

    const note_text =
    document.getElementById(
        "noteText"
    ).value;

    if(
        !title ||
        !note_text
    ){

        alert(
            "Enter Title and Note"
        );

        return;

    }

    fetch(

        "/api/add-note",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                user_id:userId,

                subject,

                title,

                note_text

            })

        }

    )

    .then(
        res => res.json()
    )

    .then(data => {

    

        showNotes();

    });

}
function editNote(
    

    noteId

){enterExamMode();

    editingNoteId = noteId;

    const card = notesData.find(

        n => n.id == noteId

    );

    document.getElementById(
        "editNoteTitle"
    ).value = card.title || "";

    document.getElementById(
        "editNoteText"
    ).value = card.note_text || "";

    document.getElementById(
        "editNoteModal"
    ).style.display = "block";
    

}
function closeEditNoteModal(){
    exitExamMode();

    document.getElementById(
        "editNoteModal"
    ).style.display = "none";
    

}

function deleteNote(

    noteId

){

    deletingNoteId = noteId;

    document.getElementById(

        "deleteNoteModal"

    ).style.display = "block";

}
function closeDeleteModal(){

    document.getElementById(

        "deleteNoteModal"

    ).style.display = "none";

}
function confirmDeleteNote(){

    if(bulkDeleteMode){

        fetch(
            "/api/delete-notes",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    note_ids:
                    selectedNotes

                })

            }
        )

        .then(
            res => res.json()
        )

        .then(data=>{

            bulkDeleteMode = false;

            selectedNotes = [];

            closeDeleteModal();

            showNotes();

        });

        return;

    }

    fetch(
        "/api/delete-note",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                note_id:
                deletingNoteId

            })

        }
    )

    .then(
        res => res.json()
    )

    .then(data=>{

        closeDeleteModal();

        showNotes();

    });


}
// =========================
// Tests
// =========================

function showTests(){
    setActiveMenu(

        "menuTests"

    );

    fetch("/api/exams")

    .then(res => res.json())

    .then(exams => {

        let html = `

<div class="test-series-container">

`;

        exams.forEach(exam => {

            html += `

<div class="test-box">

    <div class="heading-row">

    <img

    src="${exam.logo ? '/uploads/' + exam.logo : 'uploads/default.png'}"

    class="exam-logo">

    <div class="exam-title-block">

        <h2 class="exam-title">

            ${exam.name}

        </h2>

        <p class="exam-subtitle">

            ${exam.subtitle || ""}

        </p>

    </div>

</div>

    <p class="tests">
    ${exam.total_papers}+ Tests
</p>

    <button
        class="test-btn"
        onclick="loadPapers(${exam.id})">

        View Test Series

    </button>

</div>

`;

        });

        html += "</div>";

        document.getElementById(
            "content-area"
        ).innerHTML = html;

    });

}

// =========================
// Papers
// =========================

function loadPapers(examId){

    fetch("/api/papers/" + examId)

    .then(res => res.json())

    .then(papers => {
        papers.sort((a, b) => {

    const seriesA =
    Number(
        a.subtitle?.match(/\(Series\s*(\d+)\)/)?.[1]
    ) || 0;

    const seriesB =
    Number(
        b.subtitle?.match(/\(Series\s*(\d+)\)/)?.[1]
    ) || 0;

    if(seriesA !== seriesB){

        return seriesA - seriesB;

    }

    const mockA =
    Number(
        a.name.replace(/\D/g, "")
    ) || 0;

    const mockB =
    Number(
        b.name.replace(/\D/g, "")
    ) || 0;

    return mockA - mockB;

});


        let html = `

<div class="paper-filter-bar">

<select
id="languageFilter"
class="paper-filter"
onchange="filterPapers()"
>

<option value="All">

All Languages

</option>

<option value="English">

English

</option>

<option value="Hindi">
Hindi
</option>

</select>
<select
id="attemptFilter"
class="paper-filter"
onchange="filterPapers()"
>

<option value="All">
All Papers
</option>

<option value="Attempted">
Attempted
</option>

<option value="NotAttempted">
Not Attempted
</option>

</select>

<select
id="subtitleFilter"
class="paper-filter"
onchange="filterPapers()"
>

<option value="All">
All Series
</option>

</select>

</div>

<div class="test-series-container">


`;

        papers.forEach(paper => {

            html += `

<div
class="test-box ${
    paper.user_attempted > 0
    ? "attempted-paper"
    : ""
}"
data-language="${paper.language || 'English'}"
data-attempted="${
    paper.user_attempted > 0
    ? 'yes'
    : 'no'
}"
data-subtitle="${paper.subtitle || ''}"
>
<span class="${

            paper.is_paid == 1

            ? "premium-badge"

            : "free-badge"

        }">

            ${

                paper.is_paid == 1

                ? "PAID"

                : "FREE"

            }

        </span>

${
paper.user_attempted > 0

?

`

<span class="attempted-badge">

✅ Attempted

</span>

`

:

""

}

    <h2>${paper.name}</h2>

<p class="paper-subtitle">
    ${paper.subtitle || ""}
</p>

<p class="paper-language">
    🌐 ${paper.language || "English"}
</p>

<div class="paper-stats">

<p class="paper-info">
⏱ Duration - ${
    paper.show_section_timer === "section"
    ? paper.section_duration
    : paper.duration_minutes
} Min
</p>

<p class="paper-info">
${paper.total_questions} Questions
</p>

</div>

<div class="paper-stats">

<p class="paper-info">
👥 ${paper.attempts_count} Attempts
</p>

<div
id="topScore-${paper.id}"
class="top-score-box"
>
🏆 Loading...
</div>

<div id="rating-${paper.id}" class="rating-box">
⭐ Loading...
</div>

</div>

<div class="btn-row">

<button
class="test-btn"
onclick="startTest(${paper.id})"
>
Start Test
</button>
</div> <!-- btn-row -->

</div> <!-- test-box -->

`;


        });

        html += "</div>";
        // console.log(html);
const subtitles = [
    ...new Set(
        papers
        .map(p => p.subtitle)
        .filter(Boolean)
    )
];
        document.getElementById(
            "content-area"
        ).innerHTML = html;
        const subtitleFilter =
document.getElementById(
    "subtitleFilter"
);

if(subtitleFilter){

    subtitles.forEach(sub => {

        subtitleFilter.innerHTML += `
        <option value="${sub}">
            ${sub}
        </option>
        `;

    });

}

        papers.forEach(paper=>{

    fetch(

        "/api/paper-top-score/" +

        paper.id

    )
    
    

    .then(res=>res.json())

    .then(data=>{

        const box =

        document.getElementById(

            "topScore-" +

            paper.id

        );

        if(!box) return;

        box.innerHTML =

        `🏆 ${data.score}
        <br>
        👤 ${data.name}`;

    });
    });
    papers.forEach(paper=>{

    fetch(

        "/api/paper-rating/" +

        paper.id

    )

    .then(res=>res.json())

    .then(data=>{

        const box =

        document.getElementById(

            "rating-" +

            paper.id

        );

        if(!box) return;

        box.innerHTML =

        `⭐ ${data.rating}
        (${data.total})`;

    });

});

    });

}

function showLeaderboard(paperId){

    document.getElementById(
        "leaderboardModal"
    ).style.display =
    "block";

    fetch(

        "/api/leaderboard/" +

        paperId

    )

    .then(res=>res.json())

    .then(rows=>{

        let html = "";

        rows.forEach(

            (row,index)=>{

                html += `

<div
style="
padding:8px;
border-bottom:1px solid #eee;
">

${index+1}.
${row.name}

-

${row.score}

</div>

`;

            }

        );

        document.getElementById(
            "leaderboardContent"
        ).innerHTML =
        html;

    });

}
function closeLeaderboard(){

    document.getElementById(
        "leaderboardModal"
    ).style.display =
    "none";

}



function startTest(paperId){

    showInstructions(
        paperId
    );

}

function showAccount(){

fetch("/api/profile")

.then(res => res.json())

.then(user => {

document.getElementById("content-area").innerHTML = `


<div class="account-container">

    <div class="account-header">

        <div class="profile-photo">
            👤
        </div>

        <div>

            <h1>${user.name || "User"}</h1>

            <p>${user.email || ""}</p>

        </div>

    </div>

    <div class="profile-card">

        <h2>Personal Information</h2>

        <label>Full Name</label>

        <input
            type="text"
            id="profileName"
            value="${user.name || ''}"
            
        >

        <label>Email</label>

        <input
            type="email"
            value="${user.email || ''}"
            readonly
        >


        <label>Date of Birth</label>

        <input
            id="dob"
            type="date"
            value="${user.dob || ''}"
        >

        <label>Location</label>

        <input
            id="location"
            type="text"
            value="${user.location || ''}"
        >

        <label>Language</label>

        <input
            id="language"
            type="text"
            value="${user.language || ''}"
        >

        <button
            class="save-btn"
            onclick="saveProfileDashboard()">

            Save Changes

        </button>
        <hr style="margin:30px 0;">

<h2>

    Purchase History

</h2>

<div id="purchaseHistory">

    Loading...

</div>

    </div>

</div>

`;
fetch(

    "/api/my-payments"

)

.then(

    res => res.json()

)

.then(

    payments => {

        let html = "";

        if(

            payments.length === 0

        ){

            html =

            "<p>No Purchase History Found</p>";

        }

        payments.forEach(payment => {

            html += `

            <div class="history-card">

                <h3>

                    ₹${payment.amount}

                </h3>

                <p>

                    ${payment.plan_days}

                    Days Premium

                </p>

                <p>

                    Status:

                    ${payment.status}

                </p>

                <p>

                    Date:

                    ${payment.created_at}

                </p>

            </div>

            `;

        });

        document.getElementById(

            "purchaseHistory"

        ).innerHTML = html;

    }

);

});


}


function saveProfileDashboard(){

const name =
document.getElementById("profileName").value;

const dob =
document.getElementById("dob").value;

const location =
document.getElementById("location").value;

const language =
document.getElementById("language").value;

fetch("/api/profile",{

    method:"POST",

    headers:{
        "Content-Type":"application/json"
    },

    body:JSON.stringify({

        name,

        dob,

        location,

        language

    })

})

.then(res => res.json())

.then(data => { console.log(data);

    alert(data.message);

});


}

function showLogin(){
    exitExamMode();

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <div class="login-card">

        

        <input
            id="email"
            type="email"
            placeholder="Enter Email">

        <input
            id="password"
            type="password"
            placeholder="Enter Password">
            <p

<p id="loginError" class="error-message"></p>

        <button
            class="test-btn"
            onclick="login()">

            Login

        </button>
        <br><br>

        <p class="switch-text">

            Don't have an account?

        </p>

        <button
            class="register-btn"
            onclick="showRegister()">

            Register

        </button>
        <button
    class="register-btn"
    onclick="showForgotPassword()">
    Reset Password
        </button>

    </div>

    `;

}
function showRegisterOtp(){

    document.getElementById(

        "pageTitle"

    ).innerText =

    "Verify OTP";

    document.getElementById(

        "content-area"

    ).innerHTML = `

    <div class="login-card">
    <p class="register-subtitle">

📧 OTP has been sent to your email

</p>

        <input

            id="regOtp"

            placeholder="Enter OTP"

        >

        <button

    id="verifyOtpBtn"

    class="test-btn"

    onclick="verifyRegisterOtp()"

>

    Verify OTP

</button>

    </div>

    `;

}

function login(){
    const errorBox =
document.getElementById(
    "loginError"
);

if(errorBox){

    errorBox.innerText = "";

}

    const email =
        document.getElementById(
            "email"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;

    fetch("/api/login",{

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            email,
            password

        })

    })

    .then(res => res.json())

    .then(data => {

        console.log(data);

        if(
        data.message ===
        "Login Successful"
        ){

            localStorage.setItem(
                "userId",
                data.id
            );

            localStorage.setItem(
                "role",
                data.role
            );

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            if(
                data.role ===
                "admin"
            ){

                location.reload();

            }
            else{

                location.reload();

            }
            

        }
        else{

    const errorBox =
    document.getElementById(
        "loginError"
    );

    if(errorBox){

        errorBox.innerText =
        data.message;

    }

}
        

    });

}
function showRegister(){

    document.getElementById(
        "pageTitle"
    ).innerText = "Register";

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <div class="login-card">

        <h2>🚀 Create Your Account</h2>

<p class="register-subtitle">

Start your ExamTarget journey

</p>
        <br><br>

        <input
    id="name"
    type="text"
    placeholder="Full Name">

<input
    id="email"
    type="email"
    placeholder="Email">

<input
    id="password"
    type="password"
    placeholder="Password">

        <button

    id="registerBtn"

    class="register-btn"

    onclick="register()">

    Register

</button>
<div class="divider">

    <span>OR</span>

</div>

        <p class="switch-text">

    Already have an account?

</p>

<button
    class="register-btn"
    onclick="showLogin()">

    Login

</button>

    </div>

    `;

}

function register(){

    const name =

        document.getElementById(

            "name"

        ).value;

    const email =

        document.getElementById(

            "email"

        ).value;

    const password =

        document.getElementById(

            "password"

        ).value;

    const btn =

        document.getElementById(

            "registerBtn"

        );

    btn.disabled = true;

    btn.innerText =

        "Sending OTP...";

    fetch(

        "/api/send-otp",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                name,

                email,

                password

            })

        }

    )

    .then(res => res.json())

    .then(data => {

        if(data.success){

            btn.innerText =

                "OTP Sent ✓";

            alert(

                "OTP Sent"

            );

            showRegisterOtp();

        }
        else{

            btn.disabled = false;

            btn.innerText =

                "Register";

            alert(

                "OTP Send Failed"

            );

        }

    })

    .catch(err => {

        btn.disabled = false;

        btn.innerText =

            "Register";

        alert(

            "Network Error"

        );

    });

}

function showForgotPassword(){

    document.getElementById(
        "pageTitle"
    ).innerText = "Forgot Password";

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <div class="login-card">

        <h2>Reset Password</h2>

        <input
            id="resetEmail"
            type="email"
            placeholder="Enter Email">

        <button

    id="sendOtpBtn"

    class="test-btn"

    onclick="sendOtp()">

    Send OTP

</button>

    </div>

    `;

}
function sendOtp(){

    const email =

    document.getElementById(

        "resetEmail"

    ).value;

    const btn =

    document.getElementById(

        "sendOtpBtn"

    );

    btn.disabled = true;

    btn.innerText =

        "Sending OTP...";

    fetch(

        "/api/send-otp",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                email

            })

        }

    )

    .then(res => res.json())

    .then(data => {

        if(data.success){

            btn.innerText =

                "OTP Sent ✓";

            alert(

                "OTP Sent"

            );

            showOtpScreen();

        }
        else{

            btn.disabled = false;

            btn.innerText =

                "Send OTP";

            alert(

                "Failed to send OTP"

            );

        }

    })

    .catch(err => {

        btn.disabled = false;

        btn.innerText =

            "Send OTP";

        alert(

            "Network Error"

        );

    });

}

function showOtpScreen(){

document.getElementById(
    "content-area"
).innerHTML = `

<div class="login-card">

    <h2>Verify OTP</h2>

    <input
        id="otp"
        type="text"
        placeholder="Enter OTP">

    <button
        class="test-btn"
        onclick="verifyOtp()">

        Verify OTP

    </button>

</div>

`;

}
function verifyOtp(){

const otp =
document.getElementById(
    "otp"
).value;

fetch("/api/verify-otp",{

    method:"POST",

    headers:{
        "Content-Type":
        "application/json"
    },

    body:JSON.stringify({
        otp
    })

})

.then(res=>res.json())

.then(data=>{

    if(data.success){

    showResetPasswordScreen();

}
    else{

        alert(
            "Invalid OTP"
        );

    }

});

}
function showResetPasswordScreen(){

document.getElementById(
    "content-area"
).innerHTML = `

<div class="login-card">

    <h2>Create New Password</h2>

    <input
        id="newPassword"
        type="password"
        placeholder="New Password">

    <input
        id="confirmPassword"
        type="password"
        placeholder="Confirm Password">

    <button
        class="test-btn"
        onclick="updatePassword()">

        Update Password

    </button>

</div>

`;

}
function updatePassword(){

const newPassword =
document.getElementById(
    "newPassword"
).value;

const confirmPassword =
document.getElementById(
    "confirmPassword"
).value;

if(

newPassword !==
confirmPassword

){

alert(
"Passwords do not match"
);

return;

}

fetch(
"/api/reset-password",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

password:
newPassword

})

}

)

.then(res=>res.json())

.then(data=>{

if(data.success){

alert(
"Password Updated Successfully"
);

showLogin();

}

else{

alert(
"Failed To Update Password"
);

}

});

}
window.onload = function(){
    if(

    localStorage.getItem(
        "adminPreview"
    ) === "yes"

    &&

    localStorage.getItem(
        "role"
    ) !== "admin"

){

    localStorage.removeItem(
        "adminPreview"
    );

}

    if(

    localStorage.getItem(
        "examCompleted"
    ) === "yes"

    &&

    localStorage.getItem(
        "resultData"
    )

){

    showResult();

}
else if(

    localStorage.getItem(
        "examRunning"
    ) === "yes"

    &&

    localStorage.getItem(
        "examCompleted"
    ) !== "yes"

){

    showTest(

        localStorage.getItem(
            "paperId"
        )

    );

    initTest();

}
else{

    const activeMenu =
localStorage.getItem(
    "activeMenu"
);

if(activeMenu === "menuProfile"){

    openProfile();

}




else if(activeMenu === "menuTests"){

    showTests();

}
else if(activeMenu === "menuLatestTests"){

    showLatestTests();

}
else if(activeMenu === "menuAttempts"){

    showMyAttempts();

}
else if(activeMenu === "menuBookmarks"){

    showBookmarks();

}
else if(activeMenu === "menuTyping"){

    showTypingPractice();

}
else if(activeMenu === "menuNotes"){

    showNotes();

}
else if(activeMenu === "menuPremium"){

    showPremiumPage();

}

else{

    showDashboard();

}

}
}
document.addEventListener(

    "contextmenu",

    function(e){

        if(

            document.body.classList.contains(
                "exam-mode"
            )

        ){

            e.preventDefault();

        }

    }

);
document.addEventListener(

    "copy",

    function(e){

        if(

            document.body.classList.contains(
                "exam-mode"
            )

        ){

            e.preventDefault();

        }

    }

);

function verifyRegisterOtp(){

    const otp =

        document.getElementById(

            "regOtp"

        ).value;

    const btn =

        document.getElementById(

            "verifyOtpBtn"

        );

    btn.disabled = true;

    btn.innerText =

        "Verifying...";

    fetch(

        "/api/verify-register-otp",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                otp

            })

        }

    )

    .then(res => res.json())

    .then(data => {

        alert(

            data.message

        );

        if(

            data.message ===

            "Registration Successful"

        ){

            showLogin();

            return;

        }

        btn.disabled = false;

        btn.innerText =

            "Verify OTP";

    })

    .catch(err => {

        btn.disabled = false;

        btn.innerText =

            "Verify OTP";

        alert(

            "Something went wrong"

        );

    });

}
function showPremiumPage(){
    setActiveMenu(

        "menuPremium"

    );
    exitExamMode();

    fetch(

        "/api/profile"

    )

    .then(res => res.json())

    .then(user => {
        console.log(user);

        if(

            user.subscription_type ===

            "premium"

        ){

            document.getElementById(

                "content-area"

            ).innerHTML = `

            <div class="premium-container">

                <h1>

                    ⭐ Premium Member

                </h1>

                <div class="plan-box">

                    <h3>

                        Active Plan

                    </h3>

                    <p>

                        Status: Premium

                    </p>

                    <p>

                        Valid Till:

                    </p>

                    <h2>

                        ${user.premium_expiry}

                    </h2>

                </div>

            </div>

            `;

        }
        else{

            showPremiumPlans();

        }

    });

}
function showPremiumPlans(){
    exitExamMode();
    if(

        localStorage.getItem(

            "loggedIn"

        ) !== "true"

    ){

        showLogin();

        return;

    }

    fetch(

        "/api/premium-plans"

    )

    .then(

        res => res.json()

    )

    .then(

        plans => {

            let html = `

            <div class="premium-container">

                <h1>

                    🏆 Upgrade To Premium

                </h1>

                <br>

            `;

            plans.forEach(plan => {

                html += `

                <div class="plan-box">

                    <h3>

                        ${plan.plan_name}

                    </h3>

                    <h2>

                        ₹${plan.price}

                    </h2>

                    <button

                        class="test-btn"

                        onclick="selectPlan(

                            ${plan.days},

                            ${plan.price}

                        )"

                    >

                        Select Plan

                    </button>

                </div>

                `;

            });

            html += `

            </div>

            `;

            document.getElementById(

                "content-area"

            ).innerHTML = html;

        }

    );

}

function selectPlan(days,amount){
    if(

        localStorage.getItem(

            "loggedIn"

        ) !== "true"

    ){

        showLogin();

        return;

    }

    document.getElementById(

        "content-area"

    ).innerHTML = `

    <div class="premium-container">

        <h1>

            Confirm Purchase

        </h1>

        <div class="plan-box">

            <h3>

                Premium Plan

            </h3>

            <p>

                Duration: ${days} Days

            </p>

            <h2>

                ₹${amount}

            </h2>

            <button

                class="test-btn"

                onclick="proceedPayment(${days},${amount})"

            >

                Proceed To Payment

            </button>

            <br><br>

            <button

                class="register-btn"

                onclick="showPremiumPage()"

            >

                Back

            </button>

        </div>

    </div>

    `;

}
function proceedPayment(days,amount){

    fetch(

        "/api/create-order",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                amount

            })

        }

    )

    .then(res => res.json())

    .then(order => {

    const options = {

        key:

        "rzp_live_T3myUMUbb8LRQ9",

        amount:

        order.amount,

        currency:

        order.currency,

        name:

        "ExamTarget",

        description:

        days + " Days Premium Plan",

        order_id:

        order.id,

        handler:function(response){

    fetch(

        "/api/verify-payment",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                ...response,

                days,

                amount

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        alert(

            data.message

        );

        if(

            data.success

        ){

            showPremiumPage();

        }

    });

}

    };

    const rzp =

    new Razorpay(options);

    rzp.open();

    });

}
async function showInstructions(paperId){

    if(
        !(await isLoggedIn())
    ){

        localStorage.setItem(
            "pendingPaperId",
            paperId
        );

        showLogin();

        return;

    }

    fetch(
        "/api/paper-info/" +
        paperId
    )

    .then(res => res.json())

    .then(async paper => {

        const sessionRes =
        await fetch(
            "/api/check-session"
        );

        const user =
        await sessionRes.json();

        if(

            paper.is_paid == 1 &&

            user.subscription_type !==
            "premium"
             &&

    localStorage.getItem(

        "adminPreview"

    ) !== "yes"

        ){

            showPremiumPlans();

            return;

        }

        loadInstructionPage(
            paperId
        );

    });

}

function loadInstructionPage(

    paperId

){

    exitExamMode();

    fetch(

        "/api/paper-settings/" +

        paperId

    )

    .then(res => res.json())

    .then(data => {

        fetch(

            "/api/section-times/" +

            paperId

        )

        .then(res => res.json())

        .then(sectionRows => {

            let durationHtml = "";

            if(
    data.show_section_timer === "section"
){

    sectionRows.forEach(
        row => {

            durationHtml += `

            <p>

                ${row.section_name} :
                ${row.duration_minutes}
                Minutes

            </p>

            `;

        }

    );

}
else{

    durationHtml = `

    <p>

        Duration :
        ${data.duration_minutes}
        Minutes

    </p>

    `;

}

            // document.getElementById(
            //     "pageTitle"
            // ).innerText =
            // "General Instructions";

            document.getElementById(
                "content-area"
            ).innerHTML = `
            <div class="exam-header">

    <h1 class="instructions-title">

        ${data.exam_name}

    </h1>

    <p class="instruction-subtitle">

        ${data.exam_subtitle || ""}

    </p>

    <div class="paper-name-box">

        📄 ${data.name}

    </div>

</div>

<div class="instructions-layout">

    <div class="instruction-sidebar">

        <h3>
            Test Details
        </h3>

        ${durationHtml}

        <p>
            Positive Marks :
            ${data.positive_marks}
        </p>

        <p>
            Negative Marks :
            ${data.negative_marks}
        </p>

        <p>
            Navigation :
            ${data.section_navigation}
        </p>

    </div>

    <div class="instruction-main">

        <br><br>

        <h3>
    📌 Important Instructions
</h3>

<ul>

    <li>
        Read each question carefully before selecting an answer.
    </li>

    <li>
        The timer will start immediately after clicking the "Start Test" button.
    </li>

    <li>
        Do not refresh, close, or navigate away from this page during the test.
    </li>

    <li>
        All responses are saved automatically while attempting the test.
    </li>

    <li>
        Questions can be marked for review and revisited before final submission.
    </li>

    <li>
        Use the question palette to quickly navigate between questions.
    </li>

    <li>
        Questions marked in green are answered, while other colors indicate different statuses.
    </li>

    <li>
        If section-wise timing is enabled, the next section will start automatically after the allotted time expires.
    </li>

    <li>
        Internet disconnection will not stop the timer. Reconnect and continue the test as soon as possible.
    </li>

    <li>
        The test will be submitted automatically when the allotted time is over.
    </li>

    <li>
        Negative marking will be applied wherever applicable.
    </li>

    <li>
        Ensure that all questions are reviewed before final submission.
    </li>

    <li>
        Once the test is submitted, answers cannot be modified.
    </li>

</ul>

        <label>

            <input
                type="checkbox"
                id="instructionCheck"
            >

            I have read all instructions.

        </label>

        <br><br>

        <button

            class="test-btn"

            onclick="launchTest(${paperId})"

        >

            Start Test

        </button>

    </div>

</div>

            `;

        });

    });

}
function enterExamMode(){
    document.body.classList.add(

        "exam-mode"

    );

    document.querySelector(

        ".sidebar"

    ).style.display =

    "none";

    document.querySelector(

        ".topbar"

    ).style.display =

    "none";

    document.querySelector(

        ".main-content"

    ).style.marginLeft =

    "0";

}

function launchTest(paperId){
    enterExamMode();

     localStorage.removeItem(

        "examCompleted"

    );

    if(
        !document.getElementById(
            "instructionCheck"
        ).checked
    ){
        alert(
            "Please accept instructions"
        );
        return;
    }

    console.log(
    "Saving paperId",
    paperId
);
localStorage.setItem(
    "newAttempt",
    "yes"
);

localStorage.removeItem(
    "questionStatus"
);
localStorage.removeItem(

    "userAnswers"

);

console.log(
    "CLEARED QUESTION TIMES"
);
localStorage.setItem(
    "paperId",
    String(
        paperId
    )
);

    localStorage.setItem(
        "examRunning",
        "yes"
    );

    showTest(

        paperId

    );

    initTest();

}

function exitExamMode(){
    document.body.classList.remove(

        "exam-mode"

    );

    document.querySelector(

        ".sidebar"

    ).style.display =

    "block";

    document.querySelector(

        ".topbar"

    ).style.display =

    "flex";

    document.querySelector(

        ".main-content"

    ).style.marginLeft =

    "260px";

}


function showTest(
    paperId
){
    enterExamMode();

    document.getElementById(
        "pageTitle"
    ).innerText =
    "Test";

    document.getElementById(
        "content-area"
    ).innerHTML = `

<div class="mainLayout">

<div class="leftPanel">

<h2 id="timer">

Loading Timer...

</h2>

<div id="questionWrapper">

<h2 id="question">

Loading...

</h2>

<div id="questionImage">

</div>

</div>

<div id="options"></div>

<br>
<div class="exam-buttons">

    <button class="exam-btn prev-btn"
onclick="previousQuestion()">
    Previous
</button>

<button class="exam-btn next-btn"
onclick="saveAndNext()">
    Save & Next
</button>

<button class="exam-btn clear-btn"
onclick="clearResponse()">
    Clear Response
</button>

<button class="exam-btn review-btn"
onclick="markForReview()">
    Mark For Review & Next
</button>

<button
id="bookmarkBtn"
    class="exam-btn"
    onclick="toggleBookmark()"
>
⭐ Bookmark
</button>

<button class="exam-btn submit-btn"
onclick="openSubmitModal()">
    Submit Test
</button>

</div>

</div>

<div class="rightPanel">
<div class="paletteLegend">


    <div class="legendItem">
        <span class="legendBox answeredLegend">
            
        </span>
        Answered
    </div>

    <div class="legendItem">
        <span class="legendBox reviewLegend">
            
        </span>
        Marked
    </div>

    <div class="legendItem">
        <span class="legendBox reviewAnsweredLegend">
            
        </span>
        Marked & Answered
    </div>

    <div class="legendItem">
        <span class="legendBox notAnsweredLegend">
            
        </span>
        Not Answered
    </div>

    <div class="legendItem">
        <span class="legendBox notVisitedLegend">
            
        </span>
        Not Visited
    </div>
    </div>


<h3 id="paletteTitle">

Question Palette

</h3>

<div id="palette">

</div>

</div>

</div>
<div id="submitModal" class="modal">
<div id="sectionModal" class="modal">

    <div class="modal-content">

        <h3>Section Change Warning</h3>

        <p>
            You are moving to the next section.
            After proceeding, you will not be able
            to return to the previous section.
        </p>

        <button
            id="sectionContinueBtn"
            class="test-btn submit-btn"
        >
            Continue
        </button>

        <button
            class="test-btn"
            onclick="closeSectionModal()"
        >
            Cancel
        </button>

    </div>

</div>

    <div class="modal-content">

        <h3>Submit Test</h3>

        <p>
            Do you want to submit the test?
        </p>

        <button class="test-btn submit-btn" onclick="finalSubmitTest()">
            Submit
        </button>

        <button class="test-btn" onclick="closeSubmitModal()">
            Cancel
        </button>

    </div>

</div>

`;

}
function openSubmitModal(){

    document.getElementById(
        "submitModal"
    ).style.display = "block";

}

function closeSubmitModal(){

    document.getElementById(
        "submitModal"
    ).style.display = "none";

}
function openSectionModal(callback){

    document.getElementById(
        "sectionModal"
    ).style.display = "block";

    document.getElementById(
        "sectionContinueBtn"
    ).onclick = function(){

        closeSectionModal();

        callback();

    };

}

function closeSectionModal(){

    document.getElementById(
        "sectionModal"
    ).style.display = "none";

}

function finalSubmitTest(){


    closeSubmitModal();

    submitTest();
    

}
window.onclick = function(event){

    const modal = document.getElementById(
        "submitModal"
    );

    if(event.target === modal){

        closeSubmitModal();

    }

}
function showResult(){
    enterExamMode();

    document.getElementById(
        "pageTitle"
    ).innerText =
    "Result";

    document.getElementById(
        "content-area"
    ).innerHTML = `

    <h2 id="score"></h2>

    <h3 id="correct"></h3>

    <h3 id="wrong"></h3>

    <h3 id="unattempted"></h3>

<br>
<h2>
Rate This Paper
</h2>

<div id="ratingBox">

<button
class="rating-star"
onclick="ratePaper(1)"
>⭐</button>

<button
class="rating-star"
onclick="ratePaper(2)"
>⭐</button>

<button
class="rating-star"
onclick="ratePaper(3)"
>⭐</button>

<button
class="rating-star"
onclick="ratePaper(4)"
>⭐</button>

<button
class="rating-star"
onclick="ratePaper(5)"
>⭐</button>

</div>

<div id="ratingMessage"></div>
<br>
    <button class="test-btn"
        onclick="reAttempt()">
        Close Result
    </button>
     <br>
    <br>

    <div id="sectionAnalysis">
    

    </div>
<br>
    <h2
style="
text-align:center;
margin:20px 0;
"
>

    Section Wise Analysis

</h2>
    <select
id="questionFilter"
onchange="filterQuestions()"
style="
width:250px;
padding:10px;
font-size:16px;
border-radius:8px;
margin-bottom:15px;
"
>

<option value="All">

All Questions

</option>

<option value="Correct">

Correct Only

</option>

<option value="Wrong">

Wrong Only

</option>

<option value="Unattempted">

Unattempted Only

</option>

</select>


    <div id="analysis"></div>

    <div id="reviewModal" class="modal"
    style="display:none;">

        <div class="modal-content">

            <span

            onclick="closeReviewModal()"

            style="

                float:right;

                cursor:pointer;

                font-size:24px;

            ">

                ×

            </span>

            <div id="reviewQuestionContent">

            </div>

        </div>

    </div>

`;
    

    loadResult();

}
function openProfile(){
    setActiveMenu(

        "menuProfile"

    );

    if(

        localStorage.getItem(
            "loggedIn"
        ) !== "true"

    ){

        localStorage.setItem(
            "openProfileAfterLogin",
            "yes"
        );

        showLogin();

        return;

    }

    showAccount();

}
function ratePaper(rating){

    fetch(

        "/api/rate-paper",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                paperId,

                rating

            })

        }

    )

    .then(res=>res.json())

    .then(data=>{

        document.getElementById(
            "ratingMessage"
        ).innerHTML =

        data.message;

    });

}
function showNotes(){
    setActiveMenu(

        "menuNotes"

    );
    exitExamMode();
    
    if(

    !localStorage.getItem(
        "userId"
    )

){

    showLogin();

    return;

}

    const userId =
    localStorage.getItem(
        "userId"
    );

    fetch(
        "/api/notes/" +
        userId
    )

    .then(
        res => res.json()
    )

    .then(data=>{
        notesData = data;

        let html = `

        <div class="notes-container">

<h2 class="notes-title">
    My Notes
</h2>



<input
    id="noteTitle"
    class="notes-input"
    placeholder="Title"
>

<textarea
    id="noteText"
    class="notes-textarea"
></textarea>

<button
    id="saveNoteBtn"
    class="notes-save-btn"
    onclick="saveNote()"
>
    Save Note
</button>   <button

id="bulkDeleteBtn"

style="display:none"

onclick="deleteSelectedNotes()"

>

🗑 Delete Selected

</button>     

        


        `;

        data.forEach(note=>{

            html += `

<div class="note-card">

<div class="note-header">

<input
type="checkbox"
onchange="toggleNoteSelection(
${note.id},
this.checked
)"
>

${note.title ? `<h3>${note.title}</h3>` : ""}

</div>
    

    <div class="note-actions">

       <button
class="edit-btn"
id="edit-btn-${note.id}"
onclick="editNote(${note.id})"
>
👁️ See
<button
class="delete-btn single-delete-btn"
onclick="deleteNote(${note.id})"
>
🗑 Delete
</button>

    </div>

</div>

`;
        });

        document.getElementById(
            "content-area"
        ).innerHTML = html;

    });

}
function toggleNoteSelection(

noteId,

checked

){

    if(checked){

        selectedNotes.push(
            noteId
        );

    }else{

        selectedNotes =
        selectedNotes.filter(
            id => id !== noteId
        );

    }

    updateNoteButtons();

}

function deleteSelectedNotes(){

    bulkDeleteMode = true;

    document.getElementById(
        "deleteNoteModal"
    ).style.display = "flex";


}
function updateNote(){

    fetch(

        "/api/update-note",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                note_id:

                editingNoteId,

                title:

                document.getElementById(
                    "editNoteTitle"
                ).value,

                note_text:

                document.getElementById(
                    "editNoteText"
                ).value

            })

        }

    )

    .then(
        res => res.json()
    )

    .then(data=>{

        alert(
            data.message
        );

        closeEditNoteModal();

        showNotes();

    });

}
function updateNoteButtons(){

 document
.querySelectorAll(
".edit-btn,.single-delete-btn"
)
.forEach(btn=>{

    btn.style.display =

    selectedNotes.length > 0

    ? "none"

    : "inline-block";

});
document
.querySelectorAll(
".single-delete-btn"
)
.forEach(btn=>{

    btn.style.display =

    selectedNotes.length > 0

    ? "none"

    : "inline-block";

});

    const deleteBtn =

    document.getElementById(
        "bulkDeleteBtn"
    );

    if(

        selectedNotes.length > 0

    ){

        deleteBtn.style.display =
        "inline-block";

        deleteBtn.innerText =
        "🗑 Delete Selected (" +
        selectedNotes.length +
        ")";

    }else{

        deleteBtn.style.display =
        "none";

    }
    const saveBtn =

document.getElementById(
    "saveNoteBtn"
);

if(saveBtn){

    saveBtn.style.display =

    selectedNotes.length > 0

    ? "none"

    : "inline-block";

}

}
function saveNote(){

    const userId =
    localStorage.getItem(
        "userId"
    );

    fetch(
        "/api/save-note",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                user_id:userId,

                title:
                document.getElementById(
                    "noteTitle"
                ).value,

                note_text:
                document.getElementById(
                    "noteText"
                ).value

            })

        }
    )

    .then(
        res=>res.json()
    )

    .then(()=>{


        showNotes();

    });

}
function getExamLogo(

    examName

){

    const name =

    examName.toLowerCase();

    if(

        name.includes("ssc")

    ){

        return

        "uploads/logos/ssc.png";

    }

    if(

        name.includes("upsc")

    ){

        return

        "uploads/logos/upsc.png";

    }

    if(

        name.includes("ibps") ||

        name.includes("bank") ||

        name.includes("po") ||

        name.includes("clerk")

    ){

        return

        "uploads/logos/ibps.png";

    }

    if(

        name.includes("rrb") ||

        name.includes("railway")

    ){

        return

        "uploads/logos/rrb.png";

    }

    if(

        name.includes("nda") ||

        name.includes("cds") ||

        name.includes("defence")

    ){

        return

        "uploads/logos/defence.png";

    }

    return

    "uploads/logos/default.png";

}
function showTypingPractice(){
    setActiveMenu(

        "menuTyping"

    );

    document.getElementById(
    "content-area"
).innerHTML = `

<div class="typing-page">

    <div class="typing-hero">

        <h1>
            ⌨️ Typing Practice
        </h1>

        <p>
            Improve your speed, accuracy and confidence.
        </p>

    </div>

    <div class="typing-card">

        <div class="typing-option">

            <label>
                Difficulty Level
            </label>

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

        </div>

        <div class="typing-option">

            <label>
                Test Duration
            </label>

            <select id="typingDuration">

                <option value="1">1 Minute</option>
                <option value="2">2 Minutes</option>
                <option value="5">5 Minutes</option>
                <option value="10">10 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>

            </select>

        </div>

        <label class="highlight-toggle">

            <input
                type="checkbox"
                id="highlightMode"
                checked
            >

            <span>
                Highlight Current Word
            </span>

        </label>

        <button
            class="typing-start-btn"
            onclick="startTypingPractice()"
        >

            🚀 Start Typing Test

        </button>

    </div>

</div>

`;

}
function startTypingPractice(){

    const category =

    document.getElementById(
        "typingCategory"
    ).value;

    const duration =

    Number(

        document.getElementById(
            "typingDuration"
        ).value

    );

    const highlight =

    document.getElementById(
        "highlightMode"
    ).checked;

    fetch(

        "/api/random-typing-test/" +

        category

    )

    .then(res => res.json())

    .then(test => {

        showTypingTest(

            test,

            duration,

            highlight

        );

    });

}
let typingStartTime = 0;
let typingTimer;

let typingTimeLeft = 0;

let typingOriginalText = "";

function showTypingTest(

    test,

    duration,

    highlight

){enterExamMode();
    highlightEnabled =
highlight;

    typingOriginalText =

    test.passage;
    typingTestId =

test.id;

typingCategory =

test.category;

    typingTimeLeft =

    duration * 60;
    typingDuration =
duration;

    document.getElementById(

        "content-area"

    ).innerHTML = `

<div class="profile-card">

<h2 id="typingTimer">

${duration}:00

</h2>

<div
    id="typingPassage"
    class="typing-passage"
>

${test.passage}

</div>

<br>

<textarea

    id="typingInput"

    rows="10"

    placeholder="Start typing here..."

></textarea>

<br><br>

<button

    class="test-btn"

    onclick="submitTypingTest()"

>

Submit Test

</button>

</div>

`;
    
    typingStarted = false;

document.getElementById(
    "typingInput"
).addEventListener(

    "input",

    function(){

        if(!typingStarted){

            typingStarted = true;

            typingStartTime =
            Date.now();

            startTypingTimer();

        }

        updateTypingHighlight();

    }

);

document.getElementById(

    "typingInput"

).addEventListener(

    "paste",

    function(e){

        e.preventDefault();

        alert(

            "Paste is not allowed."

        );

    }

);
document.getElementById(

    "typingInput"

).addEventListener(

    "keydown",

    function(e){

        if(

            (e.ctrlKey || e.metaKey)

            &&

            e.key.toLowerCase() === "v"

        ){

            e.preventDefault();

        }

    }

);

}
function updateTypingHighlight(){

    if(!highlightEnabled){
        return;
    }

    const typedText =

    document.getElementById(
        "typingInput"
    ).value;

    const typedWords =

    typedText.trim()
    .split(/\s+/)
    .filter(word => word);

    let currentIndex = 0;

    for(
        let i = 0;
        i < typedText.length;
        i++
    ){

        if(
            typedText[i] === " "
        ){
            currentIndex++;
        }

    }

    const words =

    typingOriginalText
    .split(/\s+/);

    let html = "";

    words.forEach((word,index)=>{

        if(index < typedWords.length){

            if(
                typedWords[index] === word
            ){

                html += `
                <span class="correct-word">
                    ${word}
                </span> `;
            }
            else{

                html += `
                <span class="wrong-word">
                    ${word}
                </span> `;
            }

        }
        else if(
            index === currentIndex
        ){

            html += `
            <span class="current-word active-word">
                ${word}
            </span> `;
        }
        else{

            html += word + " ";

        }

    });

    document.getElementById(
        "typingPassage"
    ).innerHTML = html;

    const activeWord =

    document.querySelector(
        ".active-word"
    );

    if(activeWord){

        activeWord.scrollIntoView({

            block:"center",
            behavior:"smooth"

        });

    }

}
function startTypingTimer(){

    clearInterval(

        typingTimer

    );

    typingTimer =

    setInterval(

        ()=>{

            typingTimeLeft--;

            const minutes =

            Math.floor(

                typingTimeLeft / 60

            );

            const seconds =

            typingTimeLeft % 60;

            document.getElementById(

                "typingTimer"

            ).innerText =

            String(minutes)

            .padStart(2,"0")

            +

            ":"

            +

            String(seconds)

            .padStart(2,"0");

            if(

                typingTimeLeft <= 0

            ){

                clearInterval(

                    typingTimer

                );

                submitTypingTest();

            }

        },

        1000

    );

}
function submitTypingTest(){

    clearInterval(
        typingTimer
    );
    exitExamMode();

    const typedText =

    document.getElementById(
        "typingInput"
    ).value.trim();

    const typedWords =

    typedText
    .split(/\s+/)
    .filter(word => word);


    const elapsedSeconds =

(Date.now() - typingStartTime) / 1000;

const elapsedMinutes =

elapsedSeconds / 60;

const grossWpm =

Math.round(

    (typedText.length / 5) /

    elapsedMinutes

);

    const originalWords =

typingOriginalText

.split(/\s+/)

.filter(word => word);

let correct = 0;
for(

    let i = 0;

    i < typedWords.length;

    i++

){

    if(

        typedWords[i] ===

        originalWords[i]

    ){

        correct++;

    }

}
const accuracy =

typedWords.length > 0

?

(

    correct /

    typedWords.length

) * 100

:

0;
fetch(

    "/api/save-typing-attempt",

    {

        method:"POST",

        headers:{

            "Content-Type":
            "application/json"

        },

        body:JSON.stringify({

            test_id:
            typingTestId,

            category:
            typingCategory,

            duration_minutes:
            typingDuration,

            typed_text:
            typedText,

            wpm:
            grossWpm,

            accuracy:
            accuracy

        })

    }

)

.then(res=>res.json())

.then(data=>{

    console.log(
        data
    );

});

    document.getElementById(
    "content-area"
).innerHTML = `

<div class="profile-card">

<h2>

Result

</h2>

<p>

Words Typed:

${typedWords.length}

</p>

<p>

Correct Words:

${correct}

</p>

<p>

WPM:

${grossWpm}

</p>

<p>

Accuracy:

${accuracy.toFixed(2)}%

</p>

</div>
<br>

<button

    class="test-btn"

    onclick="showTypingPractice()"

>

    Start New Test

</button>

`;

}

function setActiveMenu(menuId){
    localStorage.setItem(

    "activeMenu",

    menuId

);

    document
    .querySelectorAll(
        ".sidebar-menu li"
    )
    .forEach(item => {

        item.classList.remove(
            "active"
        );

    });

    const menu =

    document.getElementById(
        menuId
    );

    if(menu){

        menu.classList.add(
            "active"
        );

    }

}
function searchContent(){

    const q =

    document.getElementById(

        "globalSearch"

    ).value.trim();

    if(

        q.length < 2

    ){

        document.getElementById(

            "searchResults"

        ).style.display =

        "none";

        return;

    }

    fetch(

        "/api/search?q=" +

        encodeURIComponent(q)

    )

    .then(res=>res.json())

    .then(data=>{

        let html = "";

        data.forEach(item=>{

            html += `

            <div
            class="search-result-card"
            >

                <b>

                ${item.name}

                </b>

                <br>

                <small>

                ${item.type}

                </small>

            </div>

            `;

        });

        document.getElementById(

            "searchResults"

        ).innerHTML = html;

        document.getElementById(

            "searchResults"

        ).style.display =

        "block";

    });

}
function showBookmarks(){
     setActiveMenu(

        "menuBookmarks"

    );
     if(

        !localStorage.getItem(

            "userId"

        )

    ){

        showLogin();

        return;

    }

    fetch("/api/bookmarks")

    .then(res=>res.json())

    .then(rows=>{

        let html = `
        
        `;

        rows.forEach(q=>{

    html += `

    <div class="history-card">

        <p>
            <b>Q.</b>
            ${q.question}
        </p>

        <p>A. ${q.optionA}</p>

        <p>B. ${q.optionB}</p>

        <p>C. ${q.optionC}</p>

        <p>D. ${q.optionD}</p>

        <p style="
            color:green;
            font-weight:600;
            margin-top:10px;
        ">
            <p class="correct-answer">

✓ Correct Answer: ${q.answer}

</p>
        </p>

        <button

            class="danger-btn bookmark-remove-btn"

            onclick="removeBookmark(${q.id})"

        >
Delete
        </button>

    </div>

    `;

});
        document.getElementById(
            "content-area"
        ).innerHTML = html;

    });

}
function actualRemoveBookmark(questionId){

    fetch(

        "/api/remove-bookmark",

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

        showBookmarks();

    });

}
function removeBookmark(questionId){

    showConfirmModal(

        "Remove Bookmark",

        "Remove this bookmarked question?",

        function(){

            actualRemoveBookmark(

                questionId

            );

        }

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



let confirmAction = null;

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

function closeConfirmModal(){

    document.getElementById(
        "confirmModal"
    ).style.display = "none";

}

function runConfirmAction(){

    if(confirmAction){

        confirmAction();

    }

    closeConfirmModal();

}

function filterPapers(){

    const language =
    document.getElementById(
        "languageFilter"
    ).value;

    const attempt =
    document.getElementById(
        "attemptFilter"
    ).value;

    const subtitle =
    document.getElementById(
        "subtitleFilter"
    )?.value || "All";

    document.querySelectorAll(
        ".test-box"
    ).forEach(card => {

        const cardLanguage =
        card.dataset.language;

        const cardAttempted =
        card.dataset.attempted;

        const cardSubtitle =
        card.dataset.subtitle;

        const languageMatch =

        language === "All" ||
        cardLanguage === language;

        const attemptMatch =

        attempt === "All" ||

        (
            attempt === "Attempted" &&
            cardAttempted === "yes"
        ) ||

        (
            attempt === "NotAttempted" &&
            cardAttempted === "no"
        );

        const subtitleMatch =

        subtitle === "All" ||
        cardSubtitle === subtitle;

        card.style.display =

        languageMatch &&
        attemptMatch &&
        subtitleMatch

        ? ""

        : "none";

    });

}

function viewAttemptResult(
attemptId
){

    fetch(

        "/api/attempt-result/" +
        attemptId

    )

    .then(
        r=>r.json()
    )

    .then(attempt=>{

        const review =

        JSON.parse(
            attempt.review_json
        );

        const resultData = {

            score:
            attempt.score,

            correct:
            attempt.correct,

            wrong:
            attempt.wrong,

            unattempted:
            attempt.unattempted,

            review:
            review

        };

        localStorage.setItem(

            "resultData",

            JSON.stringify(
                resultData
            )

        );

        showResult();

    });

}