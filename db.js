
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
    "./database.db",
    err => {

        if(err){

            console.log(err);

        }else{

            console.log(
                "Database Connected"
            );

        }

    }
);

db.run(`

CREATE TABLE IF NOT EXISTS questions (

    id INTEGER PRIMARY KEY,

    section TEXT,

    question TEXT,

    optionA TEXT,

    optionB TEXT,

    optionC TEXT,

    optionD TEXT,

    answer TEXT

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS section_time_settings (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    paper_id INTEGER,

    section_name TEXT,

    duration_minutes INTEGER

)

`);

db.run(`

CREATE TABLE IF NOT EXISTS exams (

    id INTEGER PRIMARY KEY,

    name TEXT

)

`);


module.exports = db;
db.run(`

CREATE TABLE IF NOT EXISTS papers (

    id INTEGER PRIMARY KEY,

    exam_id INTEGER,

    name TEXT,

    is_paid INTEGER

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS papers (

    id INTEGER PRIMARY KEY,

    exam_id INTEGER,

    name TEXT,

    is_paid INTEGER

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS paper_questions (

    paper_id INTEGER,

    question_id INTEGER

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS paper_questions (

    paper_id INTEGER,

    question_id INTEGER

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS paper_questions (

    paper_id INTEGER,

    question_id INTEGER

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS paper_sections (

    paper_id INTEGER,

    section TEXT,

    time_minutes INTEGER

)

`);
db.run(`

CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY,

    name TEXT,

    email TEXT UNIQUE,

    password TEXT

)

`);