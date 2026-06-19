const userId =

localStorage.getItem(

    "userId"

);

fetch(

    "/api/my-attempts/" +

    userId

)

.then(

    res => res.json()

)

.then(data => {

    let html = "";

    data.forEach(

        attempt => {

            html += `

            <div
            style="

                border:1px solid #ddd;

                padding:15px;

                margin-bottom:10px;

            ">

                <h3>

    ${attempt.paper_name}

</h3>

                <p>

    Paper :

    ${attempt.paper_name}

</p>

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

    Raw :
    ${attempt.created_at}

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

            </div>

            `;

        }

    );

    document.getElementById(

        "attempts"

    ).innerHTML =

        html;

});
function viewAttempt(

    attemptId

){

    window.location.href =

    "attemptDetails.html?id=" +

    attemptId;

}