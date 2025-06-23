function checkSession() {
    if (isErrorState) {
        console.warn("Cannot send data; application is in an error state.");
        return; 
    }
    fetch('/check-session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            const userID = data.userID;
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const logoutButton = document.getElementById('logoutButton');
            const postsButton = document.getElementById('postsButton');
            const show = document.getElementById('show');


            if (data.loggedIn && typeof data.userID !== "undefined") {
                console.log(" User is logged in:", data.userID);
                connectWebSocket(data.userID);
                loadAndInitChat(data.userID);
                show.hidden = false;
                //  Hide sign-up & login buttons
                if (signUpButton) signUpButton.style.display = "none";
                if (logInButton) logInButton.style.display = "none";

                //  Show logout & posts buttons
                if (logoutButton) logoutButton.style.display = "inline-block";
                if (postsButton) postsButton.style.display = "inline-block";
            } else {
                console.log(" User is not logged in.");

                //  Show main menu and sign-up/login buttons
                if (signUpButton) signUpButton.style.display = "inline-block";
                if (logInButton) logInButton.style.display = "inline-block";
                show.hidden = true;
                //  Hide logout & posts buttons
                if (logoutButton) logoutButton.style.display = "none";
                if (postsButton) postsButton.style.display = "none";
            }
        })
        .catch(error => errorPage(500));
}

window.checkSession = checkSession;