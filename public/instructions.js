const paperId =

new URLSearchParams(

    window.location.search

).get("paper");



new URLSearchParams(

    window.location.search

).get("paper");

fetch(

    "/api/paper-settings/" +

    paperId

)

.then(res => res.json())

.then(data => {

    document.getElementById(

        "paperInfo"

    ).innerHTML =

    `

    <p>

    Duration :

    ${data.duration_minutes}

    Minutes

    </p>

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

    `;

});

function startTest(){


    if(

        !document.getElementById(

            "agree"

        ).checked

    ){

        alert(

            "Please accept instructions"

        );

        return;

    }localStorage.setItem(

        "examRunning",

        "yes"

    );


localStorage.setItem(

    "testAbandoned",

    "no"

);
localStorage.removeItem(
    "questionTimes"
);
console.log(

    "CLEARED QUESTION TIMES"

);

localStorage.removeItem(
    "questionStatus"
);

    window.location.replace(
    "db-test.html?paper=" + paperId
);

}