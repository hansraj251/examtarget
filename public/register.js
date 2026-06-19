alert("REGISTER JS");
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

    if(

        !name ||

        !email ||

        !password

    ){

        alert(

            "Fill All Fields"

        );

        return;

    }

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

        if(

            data.success

        ){

            localStorage.setItem(

                "reg_name",

                name

            );

            localStorage.setItem(

                "reg_email",

                email

            );

            localStorage.setItem(

                "reg_password",

                password

            );

            alert(

                "OTP Sent To Email"

            );

            showOtpScreen();

        }
        else{

            alert(

                "OTP Send Failed"

            );

        }

    });

}