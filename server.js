const path = require("path");
const fs = require("fs");
require("dotenv").config({
    path: __dirname + "/.env"
});
const crypto =

require("crypto");
const nodemailer =
require("nodemailer");
const bcrypt = require(
    "bcrypt"
);
const questions = require("./questions");
const express = require("express");
const session = require(
    "express-session"
);
const SQLiteStore =

require(

    "connect-sqlite3"

)(

    session

);
const db = require("./db");
const multer = require("multer");
const XLSX = require("xlsx");
const app = express();

app.use(express.json());
app.use(

    "/uploads",

    express.static(

        "/opt/render/project/src/data/uploads"

    )

);
app.use(express.static("public"));

const Razorpay =

require("razorpay");

const razorpay =

new Razorpay({

    key_id:

    process.env.RAZORPAY_KEY_ID,

    key_secret:

    process.env.RAZORPAY_KEY_SECRET

});


app.get("/api/questions", (req, res) => {
  res.json(questions);
});

app.use(express.json());
app.use(

    (req,res,next)=>{

        res.set(

            "Cache-Control",

            "no-store, no-cache, must-revalidate, private"

        );

        next();

    }

);
app.use(

    session({

        store: new SQLiteStore({

            db: "sessions.db",

            dir: process.env.RENDER
                ? "/opt/render/project/src/data"
                : "./"

        }),

        secret:

        "examscore-secret-key",

        resave:

        false,

        saveUninitialized:

        false,

        cookie: {

            maxAge:

            30 * 24 * 60 * 60 * 1000

        }

    })

);
app.use(

    checkPremiumExpiry

);

const storage = multer.diskStorage({

    destination: function(

        req,
        file,
        cb

    ){

        cb(
    null,
    "/opt/render/project/src/data/uploads"
);

    },

    filename: function(

        req,
        file,
        cb

    ){

        cb(

            null,

            Date.now() +

            path.extname(

                file.originalname

            )

        );

    }

});

const upload = multer({

    storage

});

app.post("/api/submit", (req, res) => {

    const userAnswers = req.body.userAnswers;
const questionTimes = req.body.questionTimes;

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    let review = [];

    questions.forEach(q => {

        const answer = userAnswers[q.id];

        review.push({

            question: q.question,

            yourAnswer:
                answer || "Not Answered",

            correctAnswer:
                q.answer,
                 timeSpent:

        questionTimes?.[q.id] || 0

        });

        if(answer === undefined){

            unattempted++;

        }
        else if(answer === q.answer){

            correct++;

        }
        else{

            wrong++;

        }

    });

    res.json({

        score: correct,
        total: questions.length,
        correct,
        wrong,
        unattempted,
        review

    });

});
app.get("/api/exams", (req, res) => {

    db.all(

        `SELECT

    e.id,

    e.name,
    e.subtitle,

    COALESCE(
        l.image_file,
        e.logo
    ) AS logo,

    COUNT(p.id) AS total_papers

FROM exams e

LEFT JOIN exam_logos l

ON l.id = e.logo_id

LEFT JOIN papers p

ON p.exam_id = e.id

GROUP BY

e.id,
e.name,
e.subtitle,

COALESCE(
    l.image_file,
    e.logo
)`,

        [],

        (err, rows) => {

            if(err){

                res.status(500).json(err);

                return;

            }

            res.json(rows);

        }

    );

});
app.get("/api/papers/:examId",(req,res)=>{
    console.log(
    "EXAM ID:",
    req.params.examId
);

    db.all(

        `SELECT

p.*,

(
    SELECT COUNT(*)
    FROM paper_questions pq
    WHERE pq.paper_id = p.id
) AS total_questions,

(
    SELECT SUM(duration_minutes)
    FROM section_time_settings sts
    WHERE sts.paper_id = p.id
) AS section_duration
 ,
(
    SELECT COUNT(*)
    FROM attempts a
    WHERE a.paper_id = p.id
) AS attempts_count

,

(
    SELECT COUNT(*)
    FROM attempts a
    WHERE a.paper_id = p.id
    AND a.user_id = ?
) AS user_attempted

FROM papers p

WHERE p.exam_id = ?
AND p.is_hidden = 0
`,


        [
    req.session.userId,
    req.params.examId
],
        

        (err,rows)=>{
            console.log(
    "ROWS:",
    rows
);

            if(err){
                console.log(err);
                return res.json([]);
            }
            // console.log(rows);

            res.json(rows);

        }

    );

});
app.get(
"/api/admin/papers/:examId",
(req,res)=>{

    db.all(

`SELECT *
FROM papers
WHERE exam_id = ?`,

    [req.params.examId],

    (err,rows)=>{

        if(err){
            return res.json([]);
        }

        res.json(rows);

    });

});

app.post("/api/register", async (req, res) => {

    const {

        name,
        email,
        password

    } = req.body;
    const hashedPassword =

await bcrypt.hash(

    password,

    10

);

    db.run(

        `

        INSERT INTO users (

    name,
    email,
    password,
    role

)

VALUES (

    ?,
    ?,
    ?,
    ?

)

        `,

       [

    name,
    email,
    hashedPassword,

    "user"

],

        function(err){

            if(err){

                res.json({

                    message:
                    "User already exists"

                });

                return;

            }

            res.json({

                message:
                "Registration Successful"

            });

        }

    );

});
app.post(

    "/api/verify-register-otp",

    async (req,res)=>{

        const {

            otp

        } = req.body;function verifyRegisterOtp(){

    const otp =

        document.getElementById(

            "regOtp"

        ).value;

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

    });

}

        if(

            Number(otp) !==

            Number(

                req.session.resetOtp

            )

        ){

            return res.json({

                message:

                "Invalid OTP"

            });

        }

        const name =

        req.session.regName;

        const email =

        req.session.regEmail;

        const password =

        req.session.regPassword;

        const hashedPassword =

        await bcrypt.hash(

            password,

            10

        );

        db.run(

            `

            INSERT INTO users (

                name,
                email,
                password,
                role

            )

            VALUES (

                ?,
                ?,
                ?,
                ?

            )

            `,

            [

                name,
                email,
                hashedPassword,
                "user"

            ],

            err=>{

                if(err){

                    return res.json({

                        message:

                        "User Already Exists"

                    });

                }

                req.session.regName = null;
                req.session.regEmail = null;
                req.session.regPassword = null;
                req.session.resetOtp = null;

                res.json({

                    message:

                    "Registration Successful"

                });

            }

        );

    }

);
app.post("/api/login", async (req, res) => {
    

    const {

        email,
        password

    } = req.body;

    db.get(

        `

        SELECT *
FROM users
WHERE email = ?

        `,

        [

            email

        ],

        async (err, user) => {
            if(

    !user

){

    return res.json({

        message:

        "Invalid Credentials"

    });

}

let passwordMatch = false;

if(

    user.password.startsWith(

        "$2"

    )

){

    passwordMatch =

    await bcrypt.compare(

        password,

        user.password

    );

}
else{

    passwordMatch =

    password ===

    user.password;

    if(

        passwordMatch

    ){

        const hashedPassword =

        await bcrypt.hash(

            password,

            10

        );

        db.run(

            "UPDATE users SET password = ? WHERE id = ?",

            [

                hashedPassword,

                user.id

            ]

        );

    

    }

}
//             const passwordMatch =

// await bcrypt.compare(

//     password,

//     user.password

// );

if(

    passwordMatch

){
                    req.session.userId =

    user.id;

    req.session.role =

    user.role;
    req.session.subscription_type =

user.subscription_type;

req.session.premium_expiry =

user.premium_expiry;

    res.json({

    message:

    "Login Successful",

    role:

    user.role,

    id:

    user.id,

    subscription_type:

    user.subscription_type,

    premium_expiry:

    user.premium_expiry

});

console.log(user);

}
            else{

                res.json({

                    message:
                    "Invalid Credentials"

                });

            }

        }

    );

});

app.get(

    "/api/check-session",

    (req,res)=>{
        console.log(

    "check",

    req.session.userId,

    req.session.role

);

        res.json({

            userId:

            req.session.userId,

            role:

            req.session.role,

            subscription_type:

            req.session.subscription_type,

            premium_expiry:

            req.session.premium_expiry

        });

    }

);
app.get("/api/paper-top-score/:paperId",(req,res)=>{

    const paperId = req.params.paperId;

    db.get(

        `
        SELECT

        u.name,

        a.score

        FROM attempts a

        JOIN users u

        ON a.user_id = u.id

        WHERE a.paper_id = ?

        ORDER BY a.score DESC

        LIMIT 1
        `,

        [paperId],

        (err,row)=>{

            if(err){

                console.log(err);

                return res.json({
                    success:false
                });

            }

            res.json(
                row || {
                    name:"No Attempts",
                    score:0
                }
            );

        }

    );

});

app.post(

    "/api/add-exam",

    adminOnly,

    (req,res) => {
    

    const name =

req.body.name;
const subtitle = req.body.subtitle;
console.log(

    "SERVER SUBTITLE:",

    subtitle

);

const logo_id =
req.body.logo_id;


if(

    req.session.role !==

    "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

}

    db.run(

        `

        INSERT INTO exams (

    name,
    subtitle,

    logo_id

)

VALUES (

    ?,?,?

)

        `,

        [
    name,
    subtitle,
    logo_id
],

        function(err){

            if(err){

                res.json({

                    message:
                    "Error"

                });

                return;

            }

            res.json({

                message:
                "Exam Added"

            });

        }

    );

});
app.post("/api/add-paper", adminOnly, (req, res) => {

    const {

    exam_id,
    name,
    subtitle,
    paper_code,
    language,
    is_paid

} = req.body;

if(

    req.session.role !==

    "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

    }

    db.run(

`

INSERT INTO papers (

    exam_id,
    name,
    subtitle,
    language,
    paper_code,
    is_paid,
    is_hidden

)

VALUES (

    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    1

)

`,

[
    exam_id,
    name,
    subtitle,
    language,
    paper_code,
    is_paid
],

        function(err){

            if(err){

                res.json({

                    message:
                    "Error"

                });

                return;

            }

            res.json({

                message:
                "Paper Added"

            });

        }

    );

});
app.post("/api/add-question",adminOnly, (req, res) => {

    const {

    section,
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    answer

} = req.body;

if(

    req.session.role !==

    "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

    }

    db.run(

        `

        INSERT INTO questions (

            section,
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            answer

        )

        VALUES (

            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?

        )

        `,

        [

            section,
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            answer

        ],

        function(err){

            if(err){

                res.json({

                    message:
                    "Error"

                });

                return;

            }

            res.json({

                message:
                "Question Added"

            });

        }

    );

});
app.get(
"/api/questions-db",
(req, res) => {

    const filter =
    req.query.filter;

    let sql =
    "SELECT * FROM questions";

    if(
        filter ===
        "unassigned"
    ){

        sql = `
        SELECT q.*
        FROM questions q
        LEFT JOIN paper_questions pq
        ON q.id = pq.question_id
        WHERE pq.question_id IS NULL
        `;

    }

    db.all(

        sql,

        [],

        (err, rows) => {

            if(err){

                return res
                .status(500)
                .json(err);

            }

            res.json(rows);

        }

    );

});
app.post(

    "/api/assign-question",
    adminOnly,
    

    (req,res)=>{
        if(

    req.session.role !==

    "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

}

        const {

            paper_id,

            question_ids

        } = req.body;
        if(!paper_id){

    return res.status(400).json({

        message:

        "Please select a paper"

    });

}

        if(

            !question_ids ||

            question_ids.length === 0

        ){

            res.json({

                message:

                "No Questions Selected"

            });

            return;

        }

        let completed = 0;

        question_ids.forEach(

            question_id => {

                db.run(

                    `

                    INSERT OR IGNORE

                    INTO paper_questions(

                        paper_id,

                        question_id

                    )

                    VALUES(

                        ?,

                        ?

                    )

                    `,

                    [

                        paper_id,

                        question_id

                    ],

                    () => {

                        completed++;

                        if(

                            completed ===

                            question_ids.length

                        ){

                            res.json({

                                message:

                                "Questions Assigned Successfully"

                            });

                        }

                    }

                );

            }

        );

    }

);

app.get("/api/questions-db", (req, res) => {

    db.all(

        "SELECT * FROM questions",

        [],

        (err, rows) => {

            res.json(rows);

        }

    );

});
app.get("/api/papers", (req, res) => {

    db.all(

        "SELECT * FROM papers",

        [],

        (err, rows) => {

            res.json(rows);

        }

    );

});

app.get(

    "/api/paper/:id/questions",

    (req, res) => {
        
        if(
    !req.session.userId
){

    return res.status(401).json({

        message:
        "Login Required"

    });

}

        db.get(

            "SELECT is_paid FROM papers WHERE id = ?",

            [req.params.id],

            (err,paper)=>{

                if(err || !paper){

                    return res.status(404).json({

                        message:"Paper Not Found"

                    });

                }

                if(

                    paper.is_paid == 1 &&

                    req.session.subscription_type !==

                    "premium"

                ){

                    return res.status(403).json({

                        message:

                        "Premium Required"

                    });

                }

                db.all(

            `

            SELECT

questions.id,

questions.section,

questions.question,

questions.image_url,

questions.optionA,

questions.optionB,

questions.optionC,

questions.optionD

FROM questions

JOIN paper_questions

ON questions.id =
paper_questions.question_id

WHERE paper_questions.paper_id = ?

ORDER BY questions.section,
questions.id

            `,

            [

                req.params.id

            ],

            (err, rows) => {

    res.json(rows);

}

);

            }

        );

    }

);
app.get(

    "/api/paper-info/:id",

    (req,res)=>{

        db.get(

            `
            SELECT
            id,
            is_paid
            FROM papers
            WHERE id = ?
            `,

            [req.params.id],

            (err,row)=>{

                if(err){

                    return res.status(500).json(err);

                }

                res.json(row);

            }

        );

    }

);
app.post(

    "/api/delete-user",

    adminOnly,

    (req,res)=>{

        const {

            userId

        } = req.body;

        db.get(

            "SELECT role FROM users WHERE id=?",

            [userId],

            (err,user)=>{

                if(err || !user){

                    return res.json({

                        message:

                        "User Not Found"

                    });

                }

                if(

                    user.role ===

                    "admin"

                ){

                    return res.json({

                        message:

                        "Admin Cannot Be Deleted"

                    });

                }
                if(

    Number(userId) ===

    req.session.userId

){

    return res.json({

        message:

        "You Cannot Delete Yourself"

    });

}

                db.run(

                    "DELETE FROM users WHERE id=?",

                    [userId],

                    err=>{

                        if(err){

                            return res.json({

                                message:

                                "Error"

                            });

                        }

                        res.json({

                            message:

                            "User Deleted"

                        });

                    }

                );

            }

        );

    }

);
app.get(

    "/api/users",

    adminOnly,

    (req,res)=>{

        db.all(

            `

            SELECT

            id,
            name,
            email,
            role,
            subscription_type,
            premium_expiry

            FROM users

            ORDER BY id DESC

            `,

            [],

            (err,rows)=>{

                if(err){

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }

);
app.delete(

    "/api/question/:id",adminOnly,

    (req, res) => {

        const id = req.params.id;
        

        if(

            req.session.role !== "admin"

        ){

            return res.status(403).json({

                message:

                "Access Denied"

            });

        }

        db.run(

            `

            DELETE FROM paper_questions

            WHERE question_id = ?

            `,

            [id],

            err => {

                if(err){

                    res.json({

                        message:
                        "Error"

                    });

                    return;

                }

                db.run(

                    `

                    DELETE FROM questions

                    WHERE id = ?

                    `,

                    [id],

                    err => {

                        if(err){

                            res.json({

                                message:
                                "Error"

                            });

                            return;

                        }

                        res.json({

                            message:
                            "Question Deleted"

                        });

                    }

                );

            }

        );

    }

);
app.post(

    "/api/delete-questions",

    adminOnly,

    (req,res)=>{

        const { ids } = req.body;

        if(

            !ids ||

            ids.length === 0

        ){

            return res.json({

                message:

                "No Questions Selected"

            });

        }

        const placeholders =

        ids.map(

            ()=> "?"

        ).join(",");

        db.run(

            `

            DELETE FROM paper_questions

            WHERE question_id IN (${placeholders})

            `,

            ids,

            err => {

                if(err){

                    return res.json({

                        message:

                        "Error"

                    });

                }

                db.run(

                    `

                    DELETE FROM questions

                    WHERE id IN (${placeholders})

                    `,

                    ids,

                    function(err){

                        if(err){

                            return res.json({

                                message:

                                "Error"

                            });

                        }

                        res.json({

                            message:

                            this.changes +

                            " Questions Deleted"

                        });

                    }

                );

            }

        );

    }

);
app.post(

    "/api/update-paper",adminOnly,

    (req, res) => {

        const {

    id,
    positive_marks,
    negative_marks,
    duration_minutes,
    section_navigation,
    show_section_timer,
    role

} = req.body;
        if(

    req.session.role !== "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

}

        db.run(

            `

            UPDATE papers

SET

positive_marks = ?,

negative_marks = ?,

duration_minutes = ?,

section_navigation = ?,

show_section_timer = ?

WHERE id = ?

            `,

            [

    positive_marks,

    negative_marks,

    duration_minutes,

    section_navigation,

    show_section_timer,

    id

],

            function(err){

                if(err){

                    res.json({

                        message:
                        "Error"

                    });

                    return;

                }

                res.json({

                    message:
                    "Paper Updated"

                });

            }

        );

    }

);
app.get(

    "/api/paper-settings/:id",

    (req, res) => {

        db.get(

            `

            SELECT

            p.*,

            e.name AS exam_name,

            e.subtitle AS exam_subtitle

            FROM papers p

            LEFT JOIN exams e

            ON p.exam_id = e.id

            WHERE p.id = ?

            `,

            [

                req.params.id

            ],

            (err, row) => {

                res.json(row);

            }

        );

    }

);

app.post(

    "/api/save-attempt",

    (req, res) => {

        const {

    user_id,

    paper_id,

    score,

    correct,

    wrong,

    unattempted,

    review

} = req.body;
console.log(
    "SAVE ATTEMPT BODY",
    req.body
);

        db.run(

            `

            INSERT INTO attempts (

    user_id,

    paper_id,

    score,

    correct,

    wrong,

    unattempted,

    review_json

)
    

            VALUES (

    ?, ?, ?, ?, ?, ?, ?

)

            `,

            [

    user_id,

    paper_id,

    score,

    correct,

    wrong,

    unattempted,

    JSON.stringify(

        review

    )

],

            function(err){

                if(err){console.log(

            "SAVE ATTEMPT ERROR",

            err

        );

                    res.json({

                        message:

                        "Error"

                    });

                    return;

                }
                console.log(

        "ATTEMPT SAVED"

    );
    db.run(

`
DELETE FROM attempts

WHERE user_id = ?

AND id NOT IN (

    SELECT id

    FROM attempts

    WHERE user_id = ?

    ORDER BY id DESC

    LIMIT 10

)
`,

[
    user_id,
    user_id
],

(err)=>{

    if(err){

        console.log(err);

    }

}
);

                res.json({

                    message:

                    "Attempt Saved"

                });

            }

        );

    }

);
app.get(

    "/api/my-attempts/:userId",

    (req,res)=>{

        db.all(

            `

SELECT

attempts.*,

papers.name AS paper_name

FROM attempts

JOIN papers

ON attempts.paper_id = papers.id

WHERE attempts.user_id = ?

ORDER BY attempts.id DESC

`,

            [

                req.params.userId

            ],

            (err,rows)=>{

                res.json(rows);

            }

        );

    }

);
app.get(

    "/api/attempt/:id",

    (req,res)=>{

        db.get(

            `

            SELECT *

            FROM attempts

            WHERE id = ?

            
            `,

            [

                req.params.id

            ],

            (err,row)=>{

                if(err){

                    return res.status(500).json({

                        message:"Error"

                    });

                }

                res.json(row);

            }

        );

    }

);
app.post(

    "/api/delete-paper",

    (req,res)=>{

        const {

            paper_id,

            role

        } = req.body;

        if(

            req.session.role !== "admin"

        ){

            return res.status(403).json({

                message:

                "Access Denied"

            });

        }

        db.run(

            `

            DELETE FROM paper_questions

            WHERE paper_id = ?

            `,

            [

                paper_id

            ],

            () => {

                db.run(

                    `

                    DELETE FROM attempts

                    WHERE paper_id = ?

                    `,

                    [

                        paper_id

                    ],

                    () => {

                        db.run(

                            `

                            DELETE FROM papers

                            WHERE id = ?

                            `,

                            [

                                paper_id

                            ],

                            err => {

                                if(err){

                                    res.json({

                                        message:

                                        "Error"

                                    });

                                    return;

                                }

                                res.json({

                                    message:

                                    "Paper Deleted"

                                });

                            }

                        );

                    }

                );

            }

        );

    }

);
app.get(

    "/api/admin-dashboard",adminOnly,

    (req,res)=>{

        db.get(

            `

            SELECT

            (SELECT COUNT(*) FROM users) AS users,

            (SELECT COUNT(*) FROM exams) AS exams,

            (SELECT COUNT(*) FROM papers) AS papers,
            (SELECT COUNT(*) FROM questions) AS questions,
(SELECT COUNT(*) FROM duplicate_questions) AS duplicates,
           (SELECT COUNT(*) FROM attempts) AS attempts,
           

(SELECT COALESCE(
    SUM(amount),
    0
)
FROM payments
WHERE status='success'
) AS revenue,
 (SELECT COUNT(*)

FROM users

WHERE subscription_type='premium'

) AS premiumUsers

            `,

            [],

            (err,row)=>{

                if(err){

                    res.json({

                        message:

                        "Error"

                    });

                    return;

                }

                res.json(row);

            }

        );

    }

);
app.get(

    "/api/question/:id",

    (req,res)=>{

        db.get(

            `

            SELECT *

            FROM questions

            WHERE id = ?

            `,

            [

                req.params.id

            ],

            (err,row)=>{

                res.json(row);

            }

        );

    }

);
app.post(

    "/api/update-question",adminOnly,

    (req,res)=>{

        const {

            id,

            section,

            question,

            optionA,

            optionB,

            optionC,

            optionD,

            answer,
        

    image_url,
    role

        } = req.body;
        if(

    req.session.role !==

    "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

}

        db.run(

            `

            UPDATE questions

            SET

            section = ?,

            question = ?,

            optionA = ?,

            optionB = ?,

            optionC = ?,

            optionD = ?,

            answer = ?,

            image_url = ?

            WHERE id = ?

            `,

            [

                section,

                question,

                optionA,

                optionB,

                optionC,

                optionD,

                answer,

    image_url,

                id

            ],

            err => {

                if(err){

                    res.json({

                        message:

                        "Error"

                    });

                    return;

                }

                res.json({

                    message:

                    "Question Updated"

                });

            }

        );

    }

);
app.post(

    "/api/rename-exam",

    adminOnly,

    (req,res)=>{

        const {

            id,

            name,

            subtitle

        } = req.body;

        db.run(

            `
            UPDATE exams
            SET
                name = ?,
                subtitle = ?
            WHERE id = ?
            `,

            [
                name,
                subtitle,
                id
            ],

            err => {

                if(err){

                    return res.json({
                        message:"Error"
                    });

                }

                res.json({
                    message:"Exam Updated"
                });

            }

        );

    }

);

app.post(

    "/api/delete-exam",adminOnly,

    (req,res)=>{

        const {

            id,
            role
            

        } = req.body;
        
        if(

    req.session.role !== "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

}

        db.all(

            `

            SELECT id

            FROM papers

            WHERE exam_id = ?

            `,

            [

                id

            ],

            (err,papers)=>{

                if(err){

                    res.json({

                        message:

                        "Error"

                    });

                    return;

                }

                papers.forEach(

                    p => {

                        db.run(

                            "DELETE FROM paper_questions WHERE paper_id = ?",

                            [

                                p.id

                            ]

                        );

                        db.run(

                            "DELETE FROM attempts WHERE paper_id = ?",

                            [

                                p.id

                            ]

                        );

                    }

                );

                db.run(

                    "DELETE FROM papers WHERE exam_id = ?",

                    [

                        id

                    ],

                    () => {

                        db.run(

                            "DELETE FROM exams WHERE id = ?",

                            [

                                id

                            ],

                            err => {

                                if(err){

                                    res.json({

                                        message:

                                        "Error"

                                    });

                                    return;

                                }

                                res.json({

                                    message:

                                    "Exam Deleted"

                                });

                            }

                        );

                    }

                );

            }

        );

    }

);
app.post(

    "/api/import-questions",
    adminOnly,
    upload.single("file"),

    (req,res)=>{const {

            role

        } = req.body;

        if(

            req.session.role !== "admin"

        ){

            return res.status(403).json({

                message:

                "Access Denied"

            });

        }

        try{

            const workbook =

            XLSX.readFile(

                req.file.path

            );

            const sheetName =

            workbook.SheetNames[0];

            const rows =

            XLSX.utils.sheet_to_json(

                workbook.Sheets[

                    sheetName

                ]

            );
            console.log(

    "TOTAL ROWS:",

    rows.length

);

            let imported = 0;

let skipped = 0;

let duplicate = 0;
let missingOptions = 0;
let invalidPaperCode = 0;

rows.forEach(row => {

    if(

        !row.section ||

        !row.question ||

        !row.answer

    ){

        skipped++;

        return;

    }
    console.log(
    "QUESTION:",
    row.question
);

console.log(
    "PAPER CODE:",
    row.paper_code
);

console.log(
    "ROW KEYS:",
    Object.keys(row)
);
    

    db.get(

    `

    SELECT id

FROM questions

WHERE section = ?

AND question = ?

AND optionA = ?

AND optionB = ?

AND optionC = ?

AND optionD = ?

    `,

   [

    row.section,

    row.question,

    row.optionA || "",

    row.optionB || "",

    row.optionC || "",

    row.optionD || ""

],

    (err, existing) => {

        if(existing){
            console.log(

    "DUPLICATE FOUND",

    existing.id,

    row.paper_code,

    row.question

);

    db.get(
`
SELECT *
FROM questions
WHERE id = ?
`,
[existing.id],

(err, oldQuestion)=>{

    if(
        err ||
        !oldQuestion ||
        !oldQuestion.id
    ){

        return;

    }

    db.get(

        `
        SELECT id
        FROM papers
        WHERE paper_code = ?
        `,

        [row.paper_code],

        (err,paper)=>{
             console.log(

        "LOOKUP:",

        row.paper_code

    );

    console.log(

        "RESULT:",

        paper

    );
            if(
    !paper ||
    !paper.id
){ console.log(

            "INVALID PAPER CODE",

            row.paper_code

        );

        skipped++;

        invalidPaperCode++;

    return;

}

            if(paper){
                console.log(
    "SAVING DUPLICATE",
    oldQuestion.id,
    paper.id,
    row.paper_code
);
                console.log(
    "DUPLICATE SAVE",
    oldQuestion.id,
    paper.id,
    row.paper_code
);

                db.run(
`
INSERT INTO duplicate_questions(
    existing_question_id,
    existing_paper_code,
    duplicate_paper_code,
    target_paper_id,
    question
)
VALUES(?,?,?,?,?)
`,
[
    oldQuestion.id,
    oldQuestion.paper_code,
    row.paper_code,
    paper.id,
    row.question
],
function(err){

    if(err){

        console.log(
            "DUPLICATE INSERT ERROR:",
            err
        );

    }else{

        console.log(
            "DUPLICATE SAVED:",
            this.lastID
        );

    }

}
);
    }

});

        }

    );

    duplicate++;

    return;

}
    
if(

    !row.optionA ||

    !row.optionB ||

    !row.optionC ||

    !row.optionD ||

    !row.answer

){

    missingOptions++;

}
        db.run(
            

    `
    INSERT INTO questions (

        section,
        question,
        image_url,
        optionA,
        optionB,
        optionC,
        optionD,
        answer,
        paper_code

    )

    VALUES (

        ?, ?, ?, ?, ?, ?, ?, ?, ?

    )

    `,

    [
    row.section,

    row.question,

    row.image_url || "",

    row.optionA || "",

    row.optionB || "",

    row.optionC || "",

    row.optionD || "",

    row.answer || "",

    row.paper_code
],

    function(err){

        if(err){

            console.log(err);

            return;

        }

        const questionId =
        this.lastID;
        if(row.paper_code){

    db.get(
    `
    SELECT id
    FROM papers
    WHERE paper_code = ?
    `,
    [row.paper_code],

    (err,paper)=>{

        if(!paper){

            console.log(
                "INVALID PAPER:",
                row.paper_code
            );

            invalidPaperCode++;

            db.run(
                "DELETE FROM questions WHERE id = ?",
                [questionId]
            );

            return;
        }

        db.run(
        `
        INSERT OR IGNORE
        INTO paper_questions(
            paper_id,
            question_id
        )
        VALUES(?,?)
        `,
        [
            paper.id,
            questionId
        ]
        );

        imported++;

    });

    return;
}

        if(!row.paper_code){

            imported++;

            return;

        }

        db.get(

            `
            SELECT id
            FROM papers
            WHERE paper_code = ?
            `,

            [

                row.paper_code

            ],

            (err,paper)=>{

                if(err){

                    console.log(err);

                    return;

                }

                if(paper){

                    db.run(

                        `
                        INSERT OR IGNORE
                        INTO paper_questions(

                            paper_id,

                            question_id

                        )

                        VALUES(

                            ?,

                            ?

                        )
                        `,

                        [

                            paper.id,

                            questionId

                        ]

                    );

                    console.log(

                        "Assigned:",
                        row.paper_code,
                        "-> Paper ID:",
                        paper.id

                    );

                }

                imported++;

             }

        );

    }

);   // db.run close

    }  // (err, existing) => { close

);     // outer db.get close

}); 
            res.json({

    message:

     imported +

    " Imported, " +

    skipped +

    " Invalid, " +

    duplicate +

    " Duplicate, " +

    missingOptions +

    " Questions Missing Options"

});

        }

        catch(err){

            console.log(err);

            res.json({

                message:

                "Import Error"

            });

        }

    }

);


app.post(

    "/api/delete-exams",adminOnly,

    (req,res)=>{

        const {

    ids,

    role

} = req.body;
        if(

    req.session.role !== "admin"

){

    return res.status(403).json({

        message:

        "Access Denied"

    });

}

        if(!ids || ids.length === 0){

            res.json({

                message:"No exams selected"

            });

            return;

        }

        const placeholders =

            ids.map(() => "?").join(",");

        db.run(

            `

            DELETE FROM exams

            WHERE id IN (

                ${placeholders}

            )

            `,

            ids,

            function(err){

                if(err){

                    res.json({

                        message:"Error"

                    });

                    return;

                }

                res.json({

                    message:

                    "Deleted Successfully"

                });

            }

        );

    }

);

app.post(
"/api/assign-duplicate-question",
adminOnly,
(req,res)=>{
    console.log("BODY:", req.body);

    const {
        duplicateId,
        questionId,
        paperId
    } = req.body;

    if(!paperId || !questionId){

    return res.json({

        success:false,

        message:"Invalid Data"

    });

}

   db.run(
`
INSERT OR IGNORE
INTO paper_questions(
    paper_id,
    question_id
)
VALUES(?,?)
`,
[
    paperId,
    questionId
],
err=>{

    if(err){

 console.log(err);
        return res.json({
            success:false
        });

    }
     console.log(

        "INSERTED:",

        paperId,

        questionId

    );

    db.run(
    `
    DELETE
    FROM duplicate_questions
    WHERE id = ?
    `,
    [duplicateId],
    ()=>{

        res.json({
            success:true
        });

    });

});

});

app.post(

    "/api/save-section-times",adminOnly,

    (req,res)=>{

        const {

            paper_id,

            section_times

        } = req.body;

        db.run(

            "DELETE FROM section_time_settings WHERE paper_id = ?",

            [paper_id],

            err => {

                if(err){

                    return res.json({

                        message:"Error"

                    });

                }

                let completed = 0;

                section_times.forEach(item => {

                    db.run(

                        `

                        INSERT INTO section_time_settings(

                            paper_id,

                            section_name,

                            duration_minutes

                        )

                        VALUES(

                            ?, ?, ?

                        )

                        `,

                        [

                            paper_id,

                            item.section,

                            item.time

                        ],

                        () => {

                            completed++;

                            if(

                                completed ===

                                section_times.length

                            ){

                                res.json({

                                    message:

                                    "Section Times Saved"

                                });

                            }

                        }

                    );

                });

            }

        );

    }

);
app.get(

    "/api/paper-sections/:paperId",

    (req,res)=>{

        const paperId =

        req.params.paperId;

        db.all(

            `
            SELECT DISTINCT
            questions.section
            FROM questions
            JOIN paper_questions
            ON questions.id =
            paper_questions.question_id
            WHERE
            paper_questions.paper_id = ?
            ORDER BY
            questions.section
            `,

            [paperId],

            (err,rows)=>{

                if(err){

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }

);

app.get(

    "/api/section-times/:paperId",

    (req,res)=>{

        db.all(

            `

            SELECT

            section_name,

            duration_minutes

            FROM section_time_settings

            WHERE paper_id = ?

            `,

            [req.params.paperId],

            (err,rows)=>{

                res.json(rows);

            }

        );

    }

);
app.post(

    "/api/submit-test",

    (req,res)=>{console.log("REQ BODY");
console.log(req.body);

        const {

            paper_id,

            userAnswers,

             questionTimes,

            positive_marks,

            negative_marks

        } = req.body;

        db.all(

            `

            SELECT

id,

question,

section,

answer,

optionA,

optionB,

optionC,

optionD

FROM questions

            JOIN paper_questions

            ON questions.id =

            paper_questions.question_id

            WHERE

            paper_questions.paper_id = ?
            
            `,

            [paper_id],

            (err,rows)=>{

                let correct = 0;
                let wrong = 0;
                let unattempted = 0;

                let review = [];

                rows.forEach((q,index) => {

                    const userAnswer =

                    userAnswers[q.id];

                    if(

                        userAnswer ===

                        undefined

                    ){

                        unattempted++;

                    }
                    else if(

                        userAnswer ===

                        q.answer

                    ){

                        correct++;

                    }
                    else{

                        wrong++;

                    }

                    review.push({
                        questionId: q.id,
                        questionNo:

                        index + 1,

                        section:

                        q.section,

                        question:

                        q.question,

                        options: [

    q.optionA,

    q.optionB,

    q.optionC,

    q.optionD

],

                        yourAnswer:

                        userAnswer ||

                        "Not Answered",

                        correctAnswer:

                        q.answer,

                         timeSpent:

    questionTimes?.[q.id] || 0,

                        status:

                        userAnswer ===

                        undefined

                        ? "Unattempted"

                        : userAnswer ===

                        q.answer

                        ? "Correct"

                        : "Wrong"

                    });

                });

                const score =

                    (correct *

                    Number(

                        positive_marks

                    ))

                    -

                    (wrong *

                    Number(

                        negative_marks

                    ));

                db.run(
    `
    INSERT INTO attempts (
        user_id,
        paper_id,
        score,
        correct,
        wrong,
        unattempted,
        review_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
        req.session.userId,
        paper_id,
        score,
        correct,
        wrong,
        unattempted,
        JSON.stringify(review)
    ],
    function(err){

        if(err){

            console.log(
                "ATTEMPT SAVE ERROR",
                err
            );

            return res.status(500).json({
                message: "Attempt Save Failed"
            });

        }

        console.log(
            "ATTEMPT SAVED",
            this.lastID
        );

        res.json({
            score,
            correct,
            wrong,
            unattempted,
            review
        });

    }
);

            }

        );

    }

);
app.post(

    "/api/logout",

    (req,res)=>{

        req.session.destroy(

            err => {

                if(err){

                    return res.json({

                        message:

                        "Logout Error"

                    });

                }

                res.json({

                    message:

                    "Logged Out"

                });

            }

        );

    }

);

app.get(

    "/api/profile",

    (req,res)=>{
        

        if(

            !req.session.userId

        ){

            return res.status(401).json({

                message:

                "Not Logged In"

            });

        }
        

        db.get(

    `

    SELECT

    name,
    email,
    dob,
    location,
    language,
    subscription_type,
    premium_expiry

    FROM users

    WHERE id = ?

    `,

    [

        req.session.userId

    ],

    (err,user)=>{

        if(err){

            return res.json({

                message:

                "Error"

            });

        }

        res.json(user);

    }

);

    }

);
app.post(

    "/api/profile",

    (req,res)=>{
        

        if(

            !req.session.userId

        ){

            return res.status(401).json({

                message:

                "Not Logged In"

            });

        }

        const {
            name,

            dob,
            location,
            language

        } = req.body;

        db.run(

            `

            UPDATE users

            SET
            name = ?,

            dob = ?,

            location = ?,

            language = ?

            WHERE id = ?

            `,

            [
name,
                dob,
                location,
                language,

                req.session.userId

            ],

            function(err){

                if(err){


    return res.json({

        message:

        "Error"

    });

}

                res.json({

                    message:

                    "Profile Updated"

                });

            }

        );

    }

);

const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

defaultClient.authentications["api-key"].apiKey =
process.env.BREVO_API_KEY;
console.log("BREVO KEY:", !!process.env.BREVO_API_KEY);
const apiInstance =
new SibApiV3Sdk.TransactionalEmailsApi();

app.get("/test-mail", async (req, res) => {

    try {

        await apiInstance.sendTransacEmail({

            sender: {
                name: "ExamTarget",
                email: "examscore.help@gmail.com"
            },

            to: [{
                email: "hans004333@gmail.com"
            }],

            subject: "Brevo Test",

            textContent: "Brevo API working"

        });

        res.send("Mail Sent");

    } catch (err) {

        console.log(err);
        res.send("Error");

    }

});
app.post("/api/send-otp",

async(req,res)=>{

const {

    name,

    email,

    password

} = req.body;

const otp =
Math.floor(
100000 + Math.random()*900000
);

req.session.resetOtp =
otp;

req.session.resetEmail =
email;
req.session.regName =

name;

req.session.regEmail =

email;

req.session.regPassword =

password;

try{

await apiInstance.sendTransacEmail({

    sender: {
        name: "ExamTarget",
        email: "examscore.help@gmail.com"
    },

    to: [{
        email: email
    }],

    subject: "Registration OTP",

    textContent: `Your OTP is ${otp}`

});

res.json({
    success:true
});

}

catch(err){

console.log(err);

res.json({
    success:false
});

}

});


app.post("/api/verify-otp",

(req,res)=>{

    const {otp} =
    req.body;

    if(
        Number(otp) ===
        req.session.resetOtp
    ){

        res.json({
            success:true
        });

    }
    else{

        res.json({
            success:false
        });

    }

});
app.post("/api/reset-password",

async(req,res)=>{

const {password} =
req.body;

const hashedPassword =
await bcrypt.hash(
    password,
    10
);

db.run(

`

UPDATE users

SET password = ?

WHERE email = ?

`,

[
    hashedPassword,
    req.session.resetEmail
],

function(err){

    if(err){

        return res.json({
            success:false
        });

    }

    res.json({
        success:true
    });

}

);

});



app.get(

    "/api/available-questions",

    (req,res)=>{

        db.all(

            `

            SELECT *

            FROM questions

            WHERE id NOT IN (

                SELECT question_id

                FROM paper_questions

            )

            `,

            [],

            (err,rows)=>{

                if(err){

                    res.status(500).json(err);

                    return;

                }

                res.json(rows);

            }

        );

    }

);
function checkPremiumExpiry(

    req,

    res,

    next

){

    if(

        !req.session.userId

    ){

        return next();

    }

    db.get(

        "SELECT * FROM users WHERE id=?",

        [req.session.userId],

        (err,user)=>{

            const today = new Date();

today.setHours(0,0,0,0);

const expiry = new Date(user.premium_expiry);

expiry.setHours(23,59,59,999);

            if(

                user &&

                user.subscription_type === "premium" &&

                user.premium_expiry &&

                new Date(user.premium_expiry) < new Date()

            ){

                db.run(

                    `

                    UPDATE users

                    SET

                    subscription_type='free',

                    premium_expiry=NULL

                    WHERE id=?

                    `,

                    [user.id]

                );

                req.session.subscription_type =

                "free";

            }

            next();

        }

    );

}
function adminOnly(

    req,

    res,

    next

){

    if(

        req.session.role !==

        "admin"

    ){

        return res.status(403).json({

            message:

            "Access Denied"

        });

    }

    next();

}
function userOnly(

    req,

    res,

    next

){

    if(

        !req.session.userId

    ){

        return res.status(401).json({

            message:

            "Login Required"

        });

    }

    next();

}

app.post(

    "/api/make-premium",

    adminOnly,

    (req,res)=>{

        const {

            userId,

            days

        } = req.body;

        const expiry =

            new Date();

        expiry.setDate(

            expiry.getDate() +

            days

        );

        db.run(

            `

            UPDATE users

            SET

            subscription_type = 'premium',

            premium_expiry = ?

            WHERE id = ?

            `,

            [

                expiry
                .toISOString()
                .split("T")[0],

                userId

            ],

            err => {

                if(err){

                    return res.json({

                        message:"Error"

                    });

                }

                res.json({

                    message:

                    "Premium Updated"

                });

            }

        );

    }

);
app.post(

    "/api/remove-premium",

    adminOnly,

    (req,res)=>{

        const {

            userId

        } = req.body;

        db.run(

            `

            UPDATE users

            SET

            subscription_type='free',

            premium_expiry=NULL

            WHERE id=?

            `,

            [userId],

            err=>{

                if(err){

                    return res.json({

                        message:"Error"

                    });

                }

                res.json({

                    message:

                    "Premium Removed"

                });

            }

        );

    }

);

app.get(

    "/api/payments",

    adminOnly,

    (req,res)=>{

        db.all(

            `

            SELECT

            payments.id,

            users.name,

            users.email,

            payments.amount,

            payments.plan_days,

            payments.status,

            payments.created_at

            FROM payments

            LEFT JOIN users

            ON payments.user_id = users.id

            ORDER BY payments.id DESC

            `,

            [],

            (err,rows)=>{

                if(err){

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }

);
app.get(

    "/api/my-payments",

    (req,res)=>{

        if(

            !req.session.userId

        ){

            return res.json([]);

        }

        db.all(

            `

            SELECT *

            FROM payments

            WHERE user_id = ?

            ORDER BY id DESC

            `,

            [

                req.session.userId

            ],

            (err,rows)=>{

                if(err){

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }

);
app.get(

    "/api/admin-stats",

    (req,res)=>{

        db.get(

            `

            SELECT

            COUNT(*) as totalUsers,

            SUM(
                CASE
                WHEN subscription_type='premium'
                THEN 1
                ELSE 0
                END
            ) as premiumUsers

            FROM users

            `,

            [],

            (err,userStats)=>{

                db.get(

                    `

                    SELECT

                    COUNT(*) as totalPayments,

                    COALESCE(
                        SUM(amount),
                        0
                    ) as revenue

                    FROM payments

                    WHERE status='success'

                    `,

                    [],

                    (err,paymentStats)=>{

                        res.json({

                            totalUsers:

                            userStats.totalUsers,

                            premiumUsers:

                            userStats.premiumUsers,

                            freeUsers:

                            userStats.totalUsers -

                            userStats.premiumUsers,

                            totalPayments:

                            paymentStats.totalPayments,

                            revenue:

                            paymentStats.revenue

                        });

                    }

                );

            }

        );

    }

);
app.post(

    "/api/create-order",
    userOnly,

   async (req,res,next)=>{

        if(!req.session.userId){

            return res.status(401).json({

                message:"Login Required"

            });

        }

        next();

    },

    async(req,res)=>{

        try{

            const { amount } = req.body;

            const order = await razorpay.orders.create({

                amount: amount * 100,

                currency:"INR",

                receipt:"rcpt_" + Date.now()

            });

            res.json(order);

        }

        catch(err){

            console.log(err);

            res.status(500).json({

                message:"Order Creation Failed"

            });

        }

    }

);

app.post(

    "/api/verify-payment",
    userOnly,

    (req,res)=>{

        const {

            razorpay_payment_id,

            razorpay_order_id,

            razorpay_signature,

            days,

            amount

        } = req.body;

        const body =

        razorpay_order_id +

        "|" +

        razorpay_payment_id;

        const expectedSignature =

        crypto

        .createHmac(

            "sha256",

            process.env.RAZORPAY_KEY_SECRET

        )

        .update(body)

        .digest("hex");

        if(

            expectedSignature !==

            razorpay_signature

        ){

            return res.json({

                success:false,

                message:

                "Invalid Payment"

            });

        }

        const expiry =

        new Date();

        expiry.setDate(

            expiry.getDate() +

            days

        );

        db.run(

            `

            INSERT INTO payments

            (

                user_id,

                amount,

                plan_days,

                payment_id,

                status

            )

            VALUES

            (?,?,?,?,?)

            `,

            [

                req.session.userId,

                amount,

                days,

                razorpay_payment_id,

                "success"

            ],

            ()=>{

                db.run(

                    `

                    UPDATE users

                    SET

                    subscription_type='premium',

                    premium_expiry=?

                    WHERE id=?

                    `,

                    [

                        expiry

                        .toISOString()

                        .split("T")[0],

                        req.session.userId

                    ],

                    ()=>{

                        res.json({

                            success:true,

                            message:

                            "Premium Activated"

                        });

                    }

                );

            }

        );

    }

);
app.get(

    "/api/premium-plans",

    (req,res)=>{


        db.all(

            "SELECT * FROM premium_plans ORDER BY days",

            [],

            (err,rows)=>{

                if(err){

                    console.log(err);

                    return res.status(500).json(err);

                }

                res.json(rows);

            }

        );

    }

);
app.post(

    "/api/add-premium-plan",

    (req,res)=>{

        if(

            !req.session.userId ||

            req.session.role !== "admin"

        ){

            return res.status(403).json({

                message:

                "Access Denied"

            });

        }

        const {

            plan_name,

            days,

            price

        } = req.body;

        db.run(

            `

            INSERT INTO premium_plans

            (

                plan_name,

                days,

                price

            )

            VALUES

            (

                ?,

                ?,

                ?

            )

            `,

            [

                plan_name,

                days,

                price

            ],

            function(err){

                if(err){

                    return res.status(500)

                    .json(err);

                }

                res.json({

                    message:

                    "Plan Added"

                });

            }

        );

    }

);

app.post(

    "/api/delete-premium-plan",

    (req,res)=>{

        if(

            !req.session.userId ||

            req.session.role !== "admin"

        ){

            return res.status(403).json({

                message:

                "Access Denied"

            });

        }

        db.run(

            `

            DELETE FROM premium_plans

            WHERE id = ?

            `,

            [

                req.body.id

            ],

            function(err){

                if(err){

                    return res.status(500)

                    .json(err);

                }

                res.json({

                    message:

                    "Plan Deleted"

                });

            }

        );

    }

);
app.get(

    "/api/my-payments",

    (req,res)=>{

        if(

            !req.session.userId

        ){

            return res.status(401).json([]);

        }

        db.all(

            `

            SELECT *

            FROM payments

            WHERE user_id = ?

            ORDER BY id DESC

            `,

            [

                req.session.userId

            ],

            (err,rows)=>{

                if(err){

                    return res.status(500)

                    .json(err);

                }

                res.json(rows);

            }

        );

    }

);
app.get(
    
    

    "/api/dashboard-stats",

    (req,res)=>{console.log(

    req.session

);console.log(

    req.session.userId

);
console.log(

    "dashboard",

    req.session.userId,

    req.session.role

);



        if(

            !req.session.userId

        ){

            return res.json({});

        }

        db.all(

            `

            SELECT *

            FROM attempts

            WHERE user_id = ?

            `,

            [

                req.session.userId

            ],

            (err,rows)=>{

                if(

                    err

                ){

                    return res.json({});

                }

                let testsAttempted =

                rows.length;
                console.log(

    "attempt rows",

    rows

);

                let totalCorrect = 0;

                let totalWrong = 0;

                let bestScore = 0;

                rows.forEach(row => {

                    totalCorrect +=

                    row.correct || 0;

                    totalWrong +=

                    row.wrong || 0;

                    if(

                        row.score >

                        bestScore

                    ){

                        bestScore =

                        row.score;

                    }

                });

                const accuracy =

                totalCorrect +

                totalWrong > 0

                ?

                Math.round(

                    totalCorrect

                    * 100

                    /

                    (

                        totalCorrect +

                        totalWrong

                    )

                )

                : 0;

                db.get(

                    `

                    SELECT

                    premium_expiry

                    FROM users

                    WHERE id = ?

                    `,

                    [

                        req.session.userId

                    ],

                    (err,user)=>{

                        let daysLeft = 0;

                        if(

                            user?.premium_expiry

                        ){

                            daysLeft =

                            Math.max(

                                0,

                                Math.ceil(

                                    (

                                        new Date(

                                            user.premium_expiry

                                        )

                                        -

                                        new Date()

                                    )

                                    /

                                    86400000

                                )

                            );

                        }

                        res.json({

                            testsAttempted,

                            accuracy,

                            bestScore,

                            daysLeft

                        });

                    }

                );

            }

        );

    }

);
app.post("/api/save-note",(req,res)=>{

    const {
        user_id,
        title,
        note_text
    } = req.body;

    db.run(
        `
        INSERT INTO notes
        (
            user_id,
            title,
            note_text
        )
        VALUES
        (
            ?,?,?
        )
        `,
        [
            user_id,
            title,
            note_text
        ],
        err=>{

            if(err){
                return res.json({
                    message:"Error"
                });
            }

            res.json({
                message:"Saved"
            });

        }
    );

});
app.get(
    "/api/notes/:userId",
    (req,res)=>{

        db.all(
            `
            SELECT *
            FROM notes
            WHERE user_id = ?
            ORDER BY id DESC
            `,
            [
                req.params.userId
            ],
            (err,rows)=>{

                res.json(rows);

            }
        );

    }
);
app.post(

    "/api/save-note",

    (req,res)=>{

        const {

            user_id,
            subject,
            title,
            note_text

        } = req.body;

        db.run(

            `

            INSERT INTO notes
            (
                user_id,
                subject,
                title,
                note_text
            )

            VALUES
            (
                ?,?,?,?
            )

            `,

            [

                user_id,
                subject,
                title,
                note_text

            ],

            err => {

                if(err){

                    return res.json({

                        message:"Error"

                    });

                }

                res.json({

                    message:"Saved"

                });

            }

        );

    }

);

app.get(

    "/api/notes/:userId",

    (req,res)=>{

        db.all(

            `

            SELECT *

            FROM notes

            WHERE user_id = ?

            ORDER BY id DESC

            `,

            [

                req.params.userId

            ],

            (err,rows)=>{

                if(err){

                    console.log(err);

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }

);

app.post(

    "/api/update-note",

    (req,res)=>{

        const {

            note_id,

            title,

            note_text

        } = req.body;

        db.run(

            `

            UPDATE notes

            SET

            title = ?,

            note_text = ?,

            updated_at = CURRENT_TIMESTAMP

            WHERE id = ?

            
            `,

            [

                title,

                note_text,

                note_id

            ],

            function(err){

                if(err){

                    console.log(err);

                    return res.json({

                        message:

                        "Error"

                    });

                }

                res.json({

                    message:

                    "Note Updated"

                });

            }

        );

    }

);
app.post(

"/api/delete-notes",

(req,res)=>{

    const {

        note_ids

    } = req.body;

    const placeholders =

    note_ids.map(
        ()=>"?"
    ).join(",");

    db.run(

        `

        DELETE FROM notes

        WHERE id IN (

        ${placeholders}

        )

        `,

        note_ids,

        function(err){

            if(err){

                return res.json({

                    message:"Error"

                });

            }

            res.json({

                message:

                "Notes Deleted"

            });

        }

    );

}

);
app.post(

    "/api/add-note",

    (req,res)=>{

        const {

            user_id,

            subject,

            title,

            note_text

        } = req.body;

        db.run(

            `

            INSERT INTO notes (

                user_id,

                subject,

                title,

                note_text

            )

            VALUES (

                ?, ?, ?, ?

            )

            `,

            [

                user_id,

                subject,

                title,

                note_text

            ],

            function(err){

                if(err){

                    console.log(err);

                    return res.json({

                        message:

                        "Error"

                    });

                }

                res.json({

                    message:

                    "Note Saved"

                });

            }

        );

    }

);

app.post(

    "/api/delete-note",

    (req,res)=>{

        const {

            note_id

        } = req.body;

        db.run(

            `

            DELETE FROM notes

            WHERE id = ?

            
            `,

            [

                note_id

            ],

            function(err){

                if(err){

                    console.log(err);

                    return res.json({

                        message:

                        "Error"

                    });

                }

                res.json({

                    message:

                    "Note Deleted"

                });

            }

        );

    }

);

app.get(

    "/api/search-notes/:userId/:keyword",

    (req,res)=>{

        const keyword =

        "%" +

        req.params.keyword +

        "%";

        db.all(

            `

            SELECT *

            FROM notes

            WHERE

            user_id = ?

            AND

            (

                subject LIKE ?

                OR

                title LIKE ?

                OR

                note_text LIKE ?

            )

            ORDER BY id DESC

            `,

            [

                req.params.userId,
                keyword,
                keyword,
                keyword

            ],

            (err,rows)=>{

                res.json(rows);

            }

        );

    }

);
app.post(

    "/api/add-typing-test",

    adminOnly,

    (req,res)=>{

        const {

            title,

            category,

            passage,

            duration_minutes

        } = req.body;

        db.run(

            `
            INSERT INTO typing_tests(

                title,

                category,

                passage,

                duration_minutes

            )

            VALUES(

                ?,
                ?,
                ?,
                ?

            )
            `,

            [

                title,

                category,

                passage,

                duration_minutes

            ],

            function(err){

                if(err){

                    return res.json({

                        message:
                        "Error"

                    });

                }

                res.json({

                    message:
                    "Typing Test Added"

                });

            }

        );

    }

);
app.get(

    "/api/typing-tests",

    (req,res)=>{

        db.all(

            `
            SELECT *
            FROM typing_tests
            ORDER BY id DESC
            `,

            [],

            (err,rows)=>{

                if(err){

                    return res.status(500)
                    .json(err);

                }

                res.json(rows);

            }

        );

    }

);
app.get(

    "/api/random-typing-test/:category",

    (req,res)=>{

        db.get(

            `
            SELECT *
            FROM typing_tests
            WHERE category = ?
            ORDER BY RANDOM()
            LIMIT 1
            `,

            [

                req.params.category

            ],

            (err,row)=>{

                if(err){

                    return res.status(500)
                    .json(err);

                }

                res.json(row);

            }

        );

    }

);
app.post(

    "/api/delete-typing-test",

    adminOnly,

    (req,res)=>{

        db.run(

            `
            DELETE FROM
            typing_tests
            WHERE id = ?
            `,

            [

                req.body.id

            ],

            function(err){

                if(err){

                    return res.json({

                        message:
                        "Error"

                    });

                }

                res.json({

                    message:
                    "Deleted"

                });

            }

        );

    }

);
app.post(

    "/api/save-typing-attempt",

    (req,res)=>{

        if(
            !req.session.userId
        ){

            return res.status(401).json({

                message:
                "Login Required"

            });

        }

        const {

            test_id,

            category,

            duration_minutes,

            typed_text,

            wpm,

            accuracy

        } = req.body;

        db.run(

            `
            INSERT INTO
            typing_attempts(

                user_id,

                test_id,

                category,

                duration_minutes,

                typed_text,

                wpm,

                accuracy

            )

            VALUES(

                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?

            )
            `,

            [

                req.session.userId,

                test_id,

                category,

                duration_minutes,

                typed_text,

                wpm,

                accuracy

            ],

            function(err){

                if(err){

                    console.log(err);

                    return res.status(500).json({

                        message:
                        "Error"

                    });

                }

                res.json({

                    message:
                    "Saved"

                });

            }

        );

    }

);
app.post(

    "/api/dashboard-content",

    adminOnly,

    (req,res)=>{

        const {

            title,

            content,
            content_type,
            image_url,

            button_text,

            button_link,

            sort_order

        } = req.body;

        db.run(

            `
            INSERT INTO
            dashboard_content(

                title,

                content,
                content_type,
                image_url,

                button_text,

                button_link,

                sort_order

            )

            VALUES(

                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?

            )
            `,

            [

                title,

                content,
                content_type,
                image_url,

                button_text,

                button_link,

                sort_order

            ],

            err=>{

                if(err){

                    return res.status(500).json({

                        message:
                        "Error"

                    });

                }

                res.json({

                    message:
                    "Saved"

                });

            }

        );

    }

);
app.get(

    "/api/latest-tests",

    (req,res)=>{

        db.all(

            `
            SELECT *
FROM papers

WHERE is_hidden = 0

ORDER BY id DESC

LIMIT 40
            `,

            [],

            (err,rows)=>{

                if(err){

                    console.log(err);

                    return res.status(500).json({
                        error:err.message
                    });

                }

                res.json(rows);

            }

        );

    }

);
app.get(

    "/api/dashboard-content",

    (req,res)=>{

        db.all(

            `
            SELECT *
            FROM dashboard_content

            WHERE is_active = 1

            ORDER BY sort_order
            `,

            [],

            (err,rows)=>{

                res.json(
                    rows
                );

            }

        );

    }

);
app.post(

    "/api/delete-dashboard-content",

    adminOnly,

    (req,res)=>{

        db.run(

            `
            DELETE FROM
            dashboard_content

            WHERE id = ?
            `,

            [

                req.body.id

            ],

            ()=>{

                res.json({

                    message:
                    "Deleted"

                });

            }

        );

    }

);
app.post(

    "/api/toggle-dashboard-content",

    adminOnly,

    (req,res)=>{

        db.run(

            `
            UPDATE

            dashboard_content

            SET

            is_active = ?

            WHERE id = ?
            `,

            [

                req.body.is_active,

                req.body.id

            ],

            ()=>{

                res.json({

                    message:
                    "Updated"

                });

            }

        );

    }

);
app.get(

    "/api/admin-dashboard-content",

    adminOnly,

    (req,res)=>{

        db.all(

            `
            SELECT *
            FROM dashboard_content

            ORDER BY sort_order
            `,

            [],

            (err,rows)=>{

                res.json(
                    rows
                );

            }

        );

    }

);

app.post(

    "/api/update-dashboard-content",

    adminOnly,

    (req,res)=>{

        const {

            id,

            title,

            content,

            button_text,

            button_link,

            sort_order

        } = req.body;

        db.run(

            `
            UPDATE
            dashboard_content

            SET

            title = ?,
            content = ?,
            button_text = ?,
            button_link = ?,
            sort_order = ?

            WHERE id = ?
            `,

            [

                title,

                content,

                button_text,

                button_link,

                sort_order,

                id

            ],

            err=>{

                if(err){

                    return res.status(500).json({

                        message:
                        "Update Failed"

                    });

                }

                res.json({

                    message:
                    "Updated"

                });

            }

        );

    }

);
app.post(

    "/api/upload-dashboard-image",

    adminOnly,

    upload.single(
        "image"
    ),

    (req,res)=>{

        res.json({

            image_url:

            "/uploads/" +

            req.file.filename

        });

    }

);
app.get(

    "/api/search",

    (req,res)=>{

        const q =

        "%" +

        req.query.q +

        "%";

        db.all(

            `

            SELECT
            id,
            name,
            'exam' AS type

            FROM exams

            WHERE name LIKE ?

            UNION ALL

            SELECT
            id,
            name,
            'paper' AS type

            FROM papers

            WHERE name LIKE ?

            UNION ALL

            SELECT
            id,
            question AS name,
            'question' AS type

            FROM questions

            WHERE question LIKE ?

            LIMIT 30

            `,

            [q,q,q],

            (err,rows)=>{

                res.json(
                    rows
                );

            }

        );

    }

);

app.get(
"/api/admin/all-papers",
(req,res)=>{

    db.all(

`
SELECT

papers.*,

exams.name AS exam_name,

(
    SELECT COUNT(*)
    FROM paper_questions pq
    WHERE pq.paper_id = papers.id
) AS total_questions

FROM papers

LEFT JOIN exams
ON papers.exam_id = exams.id

ORDER BY papers.id DESC
`,

[],

(err,rows)=>{

    if(err){

        console.log(err);

        return res.status(500).json({
            error:"Database Error"
        });

    }

    res.json(rows);

});

});
app.get(
"/api/admin/exams",
(req,res)=>{

    db.all(

        `
        SELECT
        id,
        name
        FROM exams
        ORDER BY name
        `,

        [],

        (err,rows)=>{

            if(err){

                return res.status(500)
                .json(err);

            }

            res.json(rows);

        }

    );

});
app.post(
"/api/admin/toggle-paper-status",
(req,res)=>{

    const {
        paperId,
        isPaid
    } = req.body;

    db.run(

        `
        UPDATE papers
        SET is_paid = ?
        WHERE id = ?
        `,

        [
            isPaid,
            paperId
        ],

        function(err){

            if(err){

                return res
                .status(500)
                .json({
                    success:false
                });

            }

            res.json({
                success:true
            });

        }

    );

});

app.post(

    "/api/toggle-paper",

    adminOnly,

    (req,res)=>{

        db.run(

            `
            UPDATE papers

            SET is_hidden =
            CASE
                WHEN is_hidden = 1
                THEN 0
                ELSE 1
            END

            WHERE id = ?
            `,

            [

                req.body.paperId

            ],

            err=>{

                if(err){

                    return res.json({

                        message:"Error"

                    });

                }

                res.json({

                    message:
                    "Updated"

                });

            }

        );

    }

);
app.get(
    "/api/admin/paper-preview/:id",
    (req,res)=>{

        const paperId =
        req.params.id;

        db.all(

            `SELECT q.*
             FROM paper_questions pq
             JOIN questions q
             ON q.id = pq.question_id
             WHERE pq.paper_id = ?`,

            [paperId],

            (err,rows)=>{

                if(err){

                    console.log(err);

                    return res.status(500).json({
                        success:false,
                        error:err.message
                    });

                }

                res.json(rows);

            }

        );

    }
);
app.get(
    "/api/debug/questions-columns",
    (req,res)=>{

        db.all(

            "PRAGMA table_info(questions)",

            [],

            (err,rows)=>{

                res.json(rows);

            }

        );

    }
);
app.get(
    "/api/debug/question-mapping",
    (req,res)=>{

        db.all(

            "SELECT name FROM sqlite_master WHERE type='table'",

            [],

            (err,tables)=>{

                res.json(tables);

            }

        );

    }
);
app.get(
    "/api/debug/paper-questions-columns",
    (req,res)=>{

        db.all(

            "PRAGMA table_info(paper_questions)",

            [],

            (err,rows)=>{

                res.json(rows);

            }

        );

    }
);


app.get(
    "/api/paper-rating/:paperId",
    (req,res)=>{

        db.get(

            `
            SELECT

            ROUND(
                AVG(rating),
                1
            ) AS rating,

            COUNT(*) AS total

            FROM paper_ratings

            WHERE paper_id = ?
            `,

            [
                req.params.paperId
            ],

            (err,row)=>{

                res.json({

                    rating:
                    row.rating || 0,

                    total:
                    row.total || 0

                });

            }

        );

    }
);

app.post(
    "/api/rate-paper",
    (req,res)=>{

        if(!req.session.userId){

            return res.json({

                success:false,

                message:"Login Required"

            });

        }

        const userId =
        req.session.userId;

        const {
            paperId,
            rating
        } = req.body;

        db.get(

            `
            SELECT *
            FROM paper_ratings
            WHERE user_id = ?
            AND paper_id = ?
            `,

            [
                userId,
                paperId
            ],

            (err,row)=>{

                if(row){

                    return res.json({

                        success:false,

                        message:
                        "You already rated this paper"

                    });

                }

                db.run(

                    `
                    INSERT INTO paper_ratings
                    (
                        user_id,
                        paper_id,
                        rating
                    )
                    VALUES
                    (?,?,?)
                    `,

                    [
                        userId,
                        paperId,
                        rating
                    ],

                    ()=>{

                        res.json({

                            success:true,

                            message:
                            "Rating Submitted"

                        });

                    }

                );

            }

        );

    }
);


app.get(
    "/api/leaderboard/:paperId",
    (req,res)=>{

        db.all(

            `
            SELECT

u.name,

MAX(a.score) as score,

MAX(a.created_at) as latest_attempt

FROM attempts a

JOIN users u

ON u.id = a.user_id

WHERE a.paper_id = ?

GROUP BY a.user_id

ORDER BY score DESC,
latest_attempt ASC

LIMIT 10
            `,

            [req.params.paperId],

            (err,rows)=>{

                if(err){

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }
);
app.post(
    "/api/bookmark-question",
    (req,res)=>{

        if(!req.session.userId){

            return res.json({
                success:false,
                message:"Login Required"
            });

        }

        const { questionId } = req.body;

        db.run(
            `
            INSERT OR IGNORE
            INTO bookmarked_questions
            (
                user_id,
                question_id
            )
            VALUES (?,?)
            `,
            [
                req.session.userId,
                questionId
            ],
            function(err){

                if(err){

                    return res.json({
                        success:false
                    });

                }

                res.json({
                    success:true,
                    message:"Bookmarked"
                });

            }
        );

    }
);

app.get(
    "/api/bookmarks",
    (req,res)=>{

        if(!req.session.userId){

            return res.json([]);

        }

        db.all(

            `
            SELECT
            q.*
            FROM questions q
            INNER JOIN bookmarked_questions b
            ON q.id = b.question_id
            WHERE b.user_id = ?
            ORDER BY b.id DESC
            `,

            [
                req.session.userId
            ],

            (err,rows)=>{

                if(err){

                    console.log(err);

                    return res.json([]);

                }

                res.json(rows);

            }

        );

    }
);

app.post(

    "/api/remove-bookmark",

    (req,res)=>{

        if(!req.session.userId){

            return res.json({
                success:false
            });

        }

        db.run(

            `
            DELETE FROM
            bookmarked_questions
            WHERE user_id = ?
            AND question_id = ?
            `,

            [

                req.session.userId,

                req.body.questionId

            ],

            function(err){

                if(err){

                    console.log(err);

                    return res.json({
                        success:false
                    });

                }

                res.json({
                    success:true
                });

            }

        );

    }

);
app.post(
    "/api/mark-paper-checked",
    adminOnly,
    (req,res)=>{

        db.run(
            `
            UPDATE papers
            SET is_checked = 1
            WHERE id = ?
            `,
            [req.body.paperId],
            err => {

                if(err){

                    console.log(err);

                    return res.json({
                        message:"Error"
                    });

                }

                res.json({
                    message:"Paper Checked"
                });

            }
        );

    }
);
app.get(
    "/api/duplicate-questions",
    adminOnly,
    (req,res)=>{

        db.all(

            `
            SELECT *
            FROM duplicate_questions
            ORDER BY id DESC
            `,

            [],

            (err,rows)=>{

                res.json(rows);

            }

        );

    }
);
app.post(
"/api/clear-all-duplicates",
adminOnly,
(req,res)=>{

    db.run(
        `
        DELETE FROM duplicate_questions
        `,
        [],
        function(err){

            if(err){

                return res.json({
                    success:false,
                    message:"Error"
                });

            }

            res.json({
                success:true,
                message:
                this.changes +
                " Duplicate Records Cleared"
            });

        }
    );

});


app.post(
"/api/generate-papers",
adminOnly,
(req,res)=>{

const {
    startDate,
    endDate,
    examId,
    language,
    mockCount,
    paperName,
} = req.body;

db.get(
`
SELECT name
FROM exams
WHERE id = ?
`,
[examId],

(err,exam)=>{

    if(
        err ||
        !exam
    ){

        return res.json({

            message:
            "Exam Not Found"

        });

    }

    const examName =
    exam.name;

    let current =
    new Date(
        startDate
    );

    const end =
    new Date(
        endDate
    );

    let total = 0;

    while(
        current <= end
    ){

        const day =
        current
        .getDate()
        .toString()
        .padStart(
            2,
            "0"
        );

        const month =
        current
        .toLocaleString(
            "en-US",
            {
                month:"short"
            }
        )
        .toLowerCase();

        const displayMonth =
        current
        .toLocaleString(
            "en-US",
            {
                month:"short"
            }
        );

        const year =
        current
        .getFullYear();

        const suffix =

        language === "Hindi"

        ? "h"

        : "e";

        for(
    let mock = 1;
    mock <= Number(mockCount);
    mock++
        ){

            const code =
`${examName.replace(/\s+/g,"")}${paperName.replace(/\s+/g,"")}m${mock}${suffix}`;

            const name =

paperName

? `Mock ${mock}`

: `Mock ${mock}`;

const subtitle =

paperName

? `${examName} ${paperName}`

: `${examName}`;

            db.run(
`
INSERT OR IGNORE
INTO papers(

    exam_id,
    name,
    subtitle,
    is_paid,
    language,
    paper_code,
    is_hidden

)

VALUES(
    ?,
    ?,
    ?,
    0,
    ?,
    ?,
    1
)
`,
[
    examId,
    name,
    subtitle,
    language,
    code
]
);

            total++;

        }

        current.setDate(
            current.getDate() + 1
        );

    }

    res.json({

        message:

        total +
        " Papers Generated"

    });

});

});

app.get(
"/api/exams",
adminOnly,
(req,res)=>{

    db.all(
`
SELECT
id,
name
FROM exams
ORDER BY name
`,
[],
(err,rows)=>{

    res.json(rows);

});

});

app.get(
"/api/paper-codes",
(req,res)=>{

    db.all(
`
SELECT

paper_code,
name

FROM papers

WHERE paper_code IS NOT NULL
AND paper_code != ''

ORDER BY paper_code
`,
[],
(err,rows)=>{

    res.json(rows);

}
);

});

app.post(
"/api/delete-papers",
adminOnly,
(req,res)=>{

const {ids} = req.body;

if(
!ids ||
ids.length === 0
){

return res.json({
message:
"No papers selected"
});

}

const placeholders =
ids.map(()=>"?").join(",");

db.run(
`
DELETE FROM paper_questions
WHERE paper_id IN (${placeholders})
`,
ids,
(err)=>{

if(err){

return res.json({
message: err.message
});

}

db.run(
`
DELETE FROM attempts
WHERE paper_id IN (${placeholders})
`,
ids,
(err)=>{

if(err){

return res.json({
message: err.message
});

}

db.run(
`
DELETE FROM papers
WHERE id IN (${placeholders})
`,
ids,
function(err){

if(err){

return res.json({
message:
err.message
});

}

res.json({

message:

this.changes +
" Papers Deleted"

});

}
);

}
);

}
);

});
app.get(
"/api/exam-logos",
adminOnly,
(req,res)=>{

    db.all(
`
SELECT
id,
name,
image_file
FROM exam_logos
ORDER BY name
`,
[],
(err,rows)=>{

    res.json(rows);

});

});

app.post(

"/api/add-logo",

adminOnly,

upload.single("logo"),

(req,res)=>{

    const name =
    req.body.name;

    const image_file =
    req.file.filename;

    db.run(

`
INSERT INTO exam_logos
(
    name,
    image_file
)
VALUES
(
    ?,?
)
`,

[name,image_file],

(err)=>{

    if(err){

        return res.json({

            success:false

        });

    }

    res.json({

        success:true

    });

});

});
app.get(

"/api/exam-logos",

adminOnly,

(req,res)=>{

    db.all(

`
SELECT
id,
name,
image_file

FROM exam_logos

ORDER BY name
`,

[],

(err,rows)=>{

    res.json(rows);

});

});

app.delete(

"/api/delete-logo/:id",

adminOnly,

(req,res)=>{

    const id =
    req.params.id;

    db.get(

`
SELECT
COUNT(*) AS cnt

FROM exams

WHERE logo_id = ?
`,

[id],

(err,row)=>{

    if(row.cnt > 0){

        return res.json({

            success:false,

            message:
            `Logo is used in ${row.cnt} exams`

        });

    }

    db.get(

`
SELECT
image_file

FROM exam_logos

WHERE id = ?
`,

[id],

(err,logo)=>{

    if(!logo){

        return res.json({

            success:false,

            message:
            "Logo not found"

        });

    }

    db.run(

`
DELETE FROM exam_logos

WHERE id = ?
`,

[id],

(err)=>{

    if(err){

        return res.json({

            success:false,

            message:
            "Delete failed"

        });

    }

    res.json({

        success:true,

        message:
        "Logo Deleted"

    });

});

});

});

});
app.get(

"/api/attempt-result/:id",

(req,res)=>{

    db.get(

`
SELECT *

FROM attempts

WHERE id = ?
AND user_id = ?
`,

[
    req.params.id,
    req.session.userId
],

(err,row)=>{

    if(err){

        return res.status(500).json({
            error:err.message
        });

    }

    res.json(row);

});

});

app.post(
"/api/import-json",
adminOnly,
upload.single("file"),
(req,res)=>{

    try{

        if(!req.file){
            

            return res.status(400).json({
                success:false,
                message:"No file selected"
            });

        }
        const uploadedFile =
req.file.path;

function deleteUploadedFile(){

    fs.unlink(
        uploadedFile,
        err => {

            if(err){

                console.log(
                    "FILE DELETE ERROR:",
                    err
                );

            }

        }
    );

}

        const jsonData = JSON.parse(
            fs.readFileSync(
                req.file.path,
                "utf8"
            )
        );

        if(!Array.isArray(jsonData)){

            return res.status(400).json({
                success:false,
                message:"JSON must be an array"
            });

        }

        let imported = 0;
        let duplicate = 0;
        let processed = 0;
let invalidPaperCode = 0;
        jsonData.forEach(row => {

            db.get(

                `
                SELECT id
                FROM questions
                WHERE section = ?
                AND question = ?
                AND optionA = ?
                AND optionB = ?
                AND optionC = ?
                AND optionD = ?
                `,

                [

                    row.section || "",
                    row.question || "",
                    row.optionA || "",
                    row.optionB || "",
                    row.optionC || "",
                    row.optionD || ""

                ],

                (err,existing)=>{

                    if(err){

                        console.log(err);

                        processed++;

                        if(
                            processed ===
                            jsonData.length
                        ){

deleteUploadedFile();
                            res.json({

                                success:true,

                                message:
imported +
" Imported, " +
duplicate +
" Duplicate, " +
invalidPaperCode +
" Invalid Paper Code"

                            });

                        }

                        return;

                    }

                    if(existing){

    db.get(
        `
        SELECT *
        FROM questions
        WHERE id = ?
        `,
        [existing.id],
        (err, oldQuestion)=>{

            if(
                !err &&
                oldQuestion
            ){

                db.get(
                    `
                    SELECT id
                    FROM papers
                    WHERE paper_code = ?
                    `,
                    [row.paper_code],
                    (err,paper)=>{

                        if(
                            !err &&
                            paper
                        ){

                            db.run(
                                `
                                INSERT INTO duplicate_questions(
                                    existing_question_id,
                                    existing_paper_code,
                                    duplicate_paper_code,
                                    target_paper_id,
                                    question
                                )
                                VALUES(?,?,?,?,?)
                                `,
                                [
                                    oldQuestion.id,
                                    oldQuestion.paper_code,
                                    row.paper_code,
                                    paper.id,
                                    row.question
                                ]
                            );

                        }

                    }
                );

            }

        }
    );

    duplicate++;
    processed++;

    if(
        processed === jsonData.length
    ){
        deleteUploadedFile();

        res.json({
            success:true,
            message:
imported +
" Imported, " +
duplicate +
" Duplicate, " +
invalidPaperCode +
" Invalid Paper Code"
        });

    }

    return;
}
if(row.paper_code){

    db.get(
    `
    SELECT id
    FROM papers
    WHERE paper_code = ?
    `,
    [row.paper_code],

    (err,paper)=>{

        if(err || !paper){

            console.log(
                "Paper Not Found:",
                row.paper_code
            );
            invalidPaperCode++;

console.log(
    "INVALID COUNT:",
    invalidPaperCode
);

            processed++;

            if(
                processed ===
                jsonData.length
            ){
deleteUploadedFile();
                res.json({

                    success:true,

                    message:
imported +
" Imported, " +
duplicate +
" Duplicate, " +
invalidPaperCode +
" Invalid Paper Code"

                });

            }

            return;
        }

        db.run(

                        `
                        INSERT INTO questions (

                            section,
                            question,
                            optionA,
                            optionB,
                            optionC,
                            optionD,
                            answer,
                            paper_code

                        )

                        VALUES (

                            ?, ?, ?, ?, ?, ?, ?, ?

                        )
                        `,

                        [

                            row.section || "",
                            row.question || "",
                            row.optionA || "",
                            row.optionB || "",
                            row.optionC || "",
                            row.optionD || "",
                            row.answer || "",
                            row.paper_code || ""

                        ],

                        function(err){

                            if(err){

                                console.log(
                                    "QUESTION INSERT ERROR:",
                                    err
                                );

                                processed++;

                                if(
                                    processed ===
                                    jsonData.length
                                ){
deleteUploadedFile();
                                    res.json({

                                        success:true,

                                        message:
imported +
" Imported, " +
duplicate +
" Duplicate, " +
invalidPaperCode +
" Invalid Paper Code"

                                    });

                                }

                                return;

                            }

                            imported++;

                            const questionId =
                            this.lastID;

                            if(!row.paper_code){

                                processed++;

                                if(
                                    processed ===
                                    jsonData.length
                                ){
deleteUploadedFile();
                                    res.json({

                                        success:true,

                                        message:
imported +
" Imported, " +
duplicate +
" Duplicate, " +
invalidPaperCode +
" Invalid Paper Code"

                                    });

                                }

                                return;

                            }

                            db.get(

                                `
                                SELECT id
                                FROM papers
                                WHERE paper_code = ?
                                `,

                                [

                                    row.paper_code

                                ],

                                (err,paper)=>{

                                    if(
                                        err ||
                                        !paper
                                    ){

                                        console.log(
                                            "Paper Not Found:",
                                            row.paper_code
                                        );
                                        
                                        invalidPaperCode++;

    console.log(

        "INVALID COUNT:",

        invalidPaperCode

    );
                                         db.run(

        "DELETE FROM questions WHERE id = ?",

        [questionId]

    );

                                        processed++;

                                        if(
                                            processed ===
                                            jsonData.length
                                        ){
deleteUploadedFile();
                                            res.json({

                                                success:true,

                                                message:

imported +

" Imported, " +

duplicate +

" Duplicate, " +

invalidPaperCode +

" Invalid Paper Code"
                                                

                                            });

                                        }

                                        return;

                                    }

                                    db.run(

                                        `
                                        INSERT OR IGNORE
                                        INTO paper_questions(

                                            paper_id,
                                            question_id

                                        )

                                        VALUES(

                                            ?, ?

                                        )
                                        `,

                                        [

                                            paper.id,
                                            questionId

                                        ],

                                        err=>{

                                            if(err){

                                                console.log(
                                                    "ASSIGN ERROR:",
                                                    err
                                                );

                                            }

                                            processed++;

                                            if(
                                                processed ===
                                                jsonData.length
                                            ){
deleteUploadedFile();
                                                res.json({

                                                    success:true,

                                                    message:
imported +
" Imported, " +
duplicate +
" Duplicate, " +
invalidPaperCode +
" Invalid Paper Code"

                                                });

                                            }

                                        }

                                    );

                                }

                            );

                        }

                    );

    });

    return;
}

                    

                }

            );

        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            error:err.message

        });

    }

});
app.post(
"/api/assign-all-duplicates",
adminOnly,
(req,res)=>{

    db.all(
        `
        SELECT *
        FROM duplicate_questions
        `,
        [],
        (err,rows)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"Error"
                });

            }

            rows.forEach(row=>{

                db.run(
                    `
                    INSERT OR IGNORE
                    INTO paper_questions(
                        paper_id,
                        question_id
                    )
                    VALUES(?,?)
                    `,
                    [
                        row.target_paper_id,
                        row.existing_question_id
                    ]
                );

            });

            db.run(
                `
                DELETE FROM duplicate_questions
                `,
                [],
                ()=>{

                    res.json({
                        success:true,
                        message:
                        rows.length +
                        " Duplicates Assigned"
                    });

                }
            );

        }
    );

});
app.get(
    "/api/download-backup",
    adminOnly,
    (req,res)=>{

        const dbPath =
        process.env.RENDER
        ? "/opt/render/project/src/data/database.db"
        : "./database.db";

        const fileName =
        `database_backup_${Date.now()}.db`;

        res.download(
            dbPath,
            fileName
        );

    }
);
app.get(
    "/api/export-users",
    adminOnly,
    (req,res)=>{

        db.all(

            `
            SELECT
            id,
            name,
            email,
            role,
            subscription_type,
            premium_expiry
            FROM users
            ORDER BY id DESC
            `,

            [],

            (err,rows)=>{

                if(err){

                    return res
                    .status(500)
                    .send("Error");

                }

                let csv =
                "ID,Name,Email,Role,Subscription Type,Premium Expiry\n";

                rows.forEach(row=>{

                    csv +=
                    `${row.id},"${row.name}","${row.email}","${row.role}","${row.subscription_type}","${row.premium_expiry}"\n`;

                });

                res.setHeader(
                    "Content-Type",
                    "text/csv"
                );

                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=users_${Date.now()}.csv`
                );

                res.send(csv);

            }

        );

    }
);
app.get(
    "/api/export-payments",
    adminOnly,
    (req,res)=>{

        db.all(

            `
            SELECT *
            FROM payments
            ORDER BY id DESC
            `,

            [],

            (err,rows)=>{

                if(err){

                    return res
                    .status(500)
                    .send("Error");

                }

                if(rows.length === 0){

                    return res.send(
                        "No Payments Found"
                    );

                }

                const headers =
                Object.keys(rows[0]);

                let csv =
                headers.join(",") + "\n";

                rows.forEach(row=>{

                    csv +=
                    headers
                    .map(h =>
                        `"${row[h] ?? ""}"`
                    )
                    .join(",")
                    + "\n";

                });

                res.setHeader(
                    "Content-Type",
                    "text/csv"
                );

                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=payments_${Date.now()}.csv`
                );

                res.send(csv);

            }

        );

    }
);


app.post(
    "/api/restore-backup",
    adminOnly,
    upload.single("backup"),
    (req,res)=>{

        try{

            const dbPath =
            process.env.RENDER
            ? "/opt/render/project/src/data/database.db"
            : "./database.db";

            const backupPath =
            dbPath +
            ".before_restore_" +
            Date.now();

            fs.copyFileSync(
                dbPath,
                backupPath
            );

            fs.copyFileSync(
                req.file.path,
                dbPath
            );

            res.json({

                success:true,

                message:
                "Database restored successfully. Restart server."

            });

        }

        catch(err){

            console.log(err);

            res.json({

                success:false,

                message:
                "Restore failed"

            });

        }

    }
);

function createDailyBackup(){

    try{

        const dbPath =
        process.env.RENDER
        ? "/opt/render/project/src/data/database.db"
        : "./database.db";

        const backupDir =
        process.env.RENDER
        ? "/opt/render/project/src/data/backups"
        : "./backups";

        const date =
        new Date()
        .toISOString()
        .split("T")[0];

        const backupFile =
        `${backupDir}/database_${date}.db`;

        if(!fs.existsSync(backupFile)){

            fs.copyFileSync(
                dbPath,
                backupFile
            );

            console.log(
                "Backup created:",
                backupFile
            );

        }

    }

    catch(err){

        console.log(
            "Backup Error:",
            err
        );
        const backups = fs
.readdirSync(backupDir)
.filter(file =>
    file.startsWith("database_") &&
    file.endsWith(".db")
)
.sort();

if(backups.length > 30){

    const filesToDelete =
    backups.slice(
        0,
        backups.length - 30
    );

    filesToDelete.forEach(file => {

        fs.unlinkSync(
            `${backupDir}/${file}`
        );

        console.log(
            "Deleted old backup:",
            file
        );

    });

}

    }

    

}
createDailyBackup();
setInterval(
    createDailyBackup,
    24 * 60 * 60 * 1000
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});