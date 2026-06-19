const attemptId =

new URLSearchParams(

    window.location.search

).get("id");

fetch(

    "/api/attempt/" +

    attemptId

)

.then(

    res => res.json()

)

.then(data => {

    document.getElementById(

        "summary"

    ).innerHTML =

    `

    <h2>

        Score :

        ${data.score}

    </h2>

    <p>

        Correct :

        ${data.correct}

    </p>

    <p>

        Wrong :

        ${data.wrong}

    </p>

    <p>

        Unattempted :

        ${data.unattempted}

    </p>

    `;

    const review =

    JSON.parse(

        data.review_json

    );

    let html =

    "";

    review.forEach(

        q => {

            html += `

            <div
            style="

                border:1px solid #ddd;

                margin:10px;

                padding:10px;

            ">

                <b>

                    ${q.section}

                </b>

                <br><br>

                ${q.question}

                <br><br>

                Your Answer :

                ${q.yourAnswer}

                <br>

                Correct Answer :

                ${q.correctAnswer}

                <br>

                Status :

                ${q.status}

            </div>

            `;

        }

    );

    document.getElementById(

        "review"

    ).innerHTML =

        html;

});