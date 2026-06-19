function login(){

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
const pendingPaperId =

localStorage.getItem(
    "pendingPaperId"
);

if(pendingPaperId){

    localStorage.setItem(
        "showInstructions",
        pendingPaperId
    );

}
                window.location.href =
                "admin.html";

            }
            else{

                window.location.href =
                "home.html";

            }

        }
        else{

            alert(
                data.message
            );

        }

    })

    .catch(err => {

        console.log(err);

        alert(
            "Login Failed"
        );

    });

}