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

            res.status(403).json({

    message:

    "Access Denied"

});

            window.location.href = "home.html"

        }

    }

);


function savePaperSettings(){
    

    const section_times = [];

    document.querySelectorAll(
        "#sectionTimes input"
    ).forEach(input => {

        section_times.push({
            section: input.id.replace(
                "section_",
                ""
            ),
            time: input.value
        });
        console.log(section_times);

    });
    console.table(section_times);
    
fetch(

    "/api/save-section-times",

    {

        method:"POST",

        headers:{

            "Content-Type":

            "application/json"

        },

        body:JSON.stringify({

            paper_id:

            document.getElementById(

                "paperSelect"

            ).value,

            section_times

        })

    }

)

.then(res => res.json())

.then(data => {

    console.log(data);

});
    fetch(
        "/api/update-paper",
        {
            method:"POST",
            headers:{
                "Content-Type":
                "application/json"
            },
            body:JSON.stringify({
                id:
                document.getElementById(
                    "paperSelect"
                ).value,

                duration_minutes:

document.getElementById(

    "duration"

).value,

                positive_marks:
                document.getElementById(
                    "positiveMarks"
                ).value,

                negative_marks:
                document.getElementById(
                    "negativeMarks"
                ).value,
            

                section_navigation:
                document.getElementById(
                    "navigation"
                ).value,
                show_section_timer:
document.getElementById(
    "timerType"
).value
                
            })
            
        }
    )

    .then(async res => {

    const data =

    await res.json();

    if(

        !res.ok

    ){

        alert(

            data.message

        );

        return;

    }

    alert(

        data.message

    );

})

}

function deletePaper(){

    const paperId =

    document.getElementById(

        "paperSelect"

    ).value;

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
function actualDeletePaper(paperId){

    fetch(

        "/api/delete-paper",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify({

                paper_id:

                paperId,

                role:

                localStorage.getItem(

                    "role"

                )

            })

        }

    )

    .then(

        res => res.json()

    )

    .then(

        data => {

            alert(

                data.message

            );

            showAdminPapers();

        }

    );

}
function loadPaperSections(){

    const paperId =

    document.getElementById(
        "paperSelect"
    ).value;

    fetch(
        "/api/paper-sections/" +
        paperId
    )

    .then(res => res.json())

    .then(sections => {

        let html = "";

        sections.forEach(item => {

            html += `

            <p>

                ${item.section}

                Time (Minutes)

            </p>

            <input
                type="number"
                id="section_${item.section}"
                placeholder="Minutes">

            <br><br>

            `;

        });

        document.getElementById(
            "sectionTimes"
        ).innerHTML = html;

        fetch(

            "/api/section-times/" +

            paperId

        )

        .then(res => res.json())

        .then(times => {

            times.forEach(item => {

                const input =

                document.getElementById(

                    "section_" +

                    item.section_name

                );

                if(input){

                    input.value =

                    item.duration_minutes;

                }

            });

        });
        fetch(

    "/api/paper-settings/" +

    paperId

)

.then(res => res.json())

.then(data => {

    document.getElementById(

        "duration"

    ).value =

    data.duration_minutes || "";

    document.getElementById(

        "positiveMarks"

    ).value =

    data.positive_marks || "";

    document.getElementById(

        "negativeMarks"

    ).value =

    data.negative_marks || "";

    document.getElementById(

        "navigation"

    ).value =

    data.section_navigation || "free";

});

    })
    

    .catch(err => {

        console.log(err);

    });

}
function loadPaperSettings(){

    fetch("/api/exams")

    .then(res=>res.json())

    .then(exams=>{

        let examHtml =
        `<option value="">
        Select Exam
        </option>`;

        exams.forEach(exam=>{

            examHtml += `
            <option value="${exam.id}">
                ${exam.name}
            </option>
            `;

        });

        document.getElementById(
            "paperSettingsExamFilter"
        ).innerHTML = examHtml;

        document.getElementById(
            "paperSettingsExamFilter"
        ).addEventListener(
            "change",
            loadFilteredPapers
        );

        document.getElementById(
    "paperSubtitleFilter"
).addEventListener(
    "change",
    filterPaperSettingsBySubtitle
);
        if(exams.length){

            document.getElementById(
                "paperSettingsExamFilter"
            ).value = exams[0].id;

            loadFilteredPapers();

        }
        

    });

}

function loadFilteredPapers(){

    const examId =

    document.getElementById(

        "paperSettingsExamFilter"

    ).value;

    if(!examId){

        document.getElementById(

            "paperSelect"

        ).innerHTML = "";

        return;

    }

    fetch(
    "/api/admin/papers/" +
    examId
)

    .then(res=>res.json())

    .then(papers=>{ 

        let html = "";

        papers.forEach(p=>{

           html += `
<option value="${p.id}">
    ${p.name}
    (${p.paper_code || ""})
    ${p.is_hidden == 1 ? "🔒 Hidden" : "👁 Visible"}
</option>
`;
            let subtitleHtml = `
<option value="">
    All Subtitles
</option>
`;

const subtitles = [
    ...new Set(
        papers.map(
            p => p.subtitle
        ).filter(Boolean)
    )
];

subtitles.forEach(subtitle => {

    subtitleHtml += `
    <option value="${subtitle}">
        ${subtitle}
    </option>
    `;

});

document.getElementById(
    "paperSubtitleFilter"
).innerHTML = subtitleHtml;

window.paperSettingsPapers =
papers;

        });


        document.getElementById(
    "paperSelect"
).innerHTML = html;

if(papers.length > 0){

    loadPaperSections();

}
        document.getElementById(
    "paperSelect"
).addEventListener(
    "change",
    loadPaperSections
);

    });

}

function filterPaperSettingsBySubtitle(){

    const subtitle =

    document.getElementById(
        "paperSubtitleFilter"
    ).value;

    let html = "";

    window.paperSettingsPapers
    .filter(p => {

        if(!subtitle){
            return true;
        }

        return p.subtitle === subtitle;

    })
    .forEach(p => {

        html += `
        <option value="${p.id}">
    ${p.name}
    (${p.paper_code || ""})
</option>
        `;

    });

    document.getElementById(
        "paperSelect"
    ).innerHTML = html;
    const paperSelect =
document.getElementById(
    "paperSelect"
);

paperSelect.innerHTML = html;

if(paperSelect.options.length > 0){

    paperSelect.dispatchEvent(
        new Event("change")
    );

}

}