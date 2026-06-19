const db = require("./db");

db.run(
    `
    ALTER TABLE papers
    ADD COLUMN positive_marks REAL
    `,
    err => {
        console.log(
            err || "positive_marks added"
        );
    }
);

db.run(
    `
    ALTER TABLE papers
    ADD COLUMN negative_marks REAL
    `,
    err => {
        console.log(
            err || "negative_marks added"
        );
    }
);

db.run(
    `
    ALTER TABLE papers
    ADD COLUMN duration_minutes INTEGER
    `,
    err => {
        console.log(
            err || "duration_minutes added"
        );
    }
);

db.run(
    `
    ALTER TABLE papers
    ADD COLUMN section_navigation TEXT
    `,
    err => {
        console.log(
            err || "section_navigation added"
        );
    }
);

db.run(
    `
    ALTER TABLE papers
    ADD COLUMN show_section_timer TEXT
    `,
    err => {
        console.log(
            err || "show_section_timer added"
        );
    }
);