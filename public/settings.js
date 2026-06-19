fetch(

    "/api/check-session"

)

.then(

    res => res.json()

)

.then(

    data => {

        if(

            !data.userId

        ){

            window.location.href = "home.html"
        }

    }

);

const profileHtml = `

<h2>Profile</h2>

<div class="profile-card">

    <div class="profile-photo">

        👤

    </div>

    <p>
        <strong>Full Name :</strong>
    </p>

    <input
        id="fullName"
        type="text"
        placeholder="Enter Full Name"
    >

    <p>
        <strong>Date of Birth :</strong>
    </p>

    <input
        id="dob"
        type="date"
    >

    <p>
        <strong>Location :</strong>
    </p>

    <input
        id="location"
        type="text"
        placeholder="Enter Location"
    >

    <p>
        <strong>Default Language :</strong>
    </p>

    <input
        id="language"
        type="text"
        placeholder="Enter Language"
    >
    <button onclick="saveProfile()">

    Save Changes

</button>

</div>

`;

const examsHtml = `

<h2>Your Exams</h2>

<p>No Exams Yet</p>

`;

const accountHtml = `

<h2>Account</h2>

<p>Email</p>

<p>Mobile Number</p>

<p>Username</p>

`;
function showTab(tab){
    document.getElementById(
    "profileBtn"
).classList.remove(
    "active-tab"
);

document.getElementById(
    "examsBtn"
).classList.remove(
    "active-tab"
);

document.getElementById(
    "accountBtn"
).classList.remove(
    "active-tab"
);
if(tab === "profile"){

    document.getElementById(
        "profileBtn"
    ).classList.add(
        "active-tab"
    );

}

    if(tab === "profile"){

        document.getElementById(
            "contentArea"
        ).innerHTML = profileHtml;
        console.log(profileHtml);
        console.log("Profile Loaded");
        fetch("/api/profile")

.then(res => res.json())

.then(user => {console.log(user);console.log(
    document.getElementById("fullName")
);document.getElementById(
    "fullName"
).value = user.name;

    document.getElementById(
        "fullName"
    ).value = user.name || "";

    document.getElementById(
        "dob"
    ).value = user.dob || "";

    document.getElementById(
        "location"
    ).value = user.location || "";

    document.getElementById(
        "language"
    ).value = user.language || "";

});

    }

    if(tab === "exams"){

        document.getElementById(
            "contentArea"
        ).innerHTML = examsHtml;

    }

    if(tab === "account"){

        document.getElementById(
            "contentArea"
        ).innerHTML = accountHtml;

    }

}
showTab("profile");
fetch("/api/profile")
.then(res => res.json())
.then(user => {

    console.log(user);

    console.log(
        "fullName element:",
        document.getElementById("fullName")
    );

});fetch("/api/profile")
.then(res => res.json())
.then(user => {

    const input = document.getElementById(
        "fullName"
    );

    console.log(
        "Before:",
        input.value
    );

    input.value = user.name;

    console.log(
        "After:",
        input.value
    );

});
function saveProfile(){

    const name =

document.getElementById(
    "fullName"
).value;

    const dob =

    document.getElementById(
        "dob"
    ).value;

    const location =

    document.getElementById(
        "location"
    ).value;

    const language =

    document.getElementById(
        "language"
    ).value;

    fetch(

        "/api/profile",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

    name,
    dob,
    location,
    language

})

        }

    )

    .then(res => res.json())

    .then(data => {

        alert(
            data.message
        );

    });


}
