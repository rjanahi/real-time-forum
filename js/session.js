function checkSession() {
    return fetch('/check-session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                errorPage(response.status, response.statusText);
                throw response;
            }
            return response.json();

        })
        .then(data => {
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const logoutButton = document.getElementById('logoutButton');
            const postsButton = document.getElementById('postsButton');
            const show = document.getElementById('show');

            if (data == undefined) {
                data = { loggedIn: false, userID: null };
            }

            if (data.loggedIn && typeof data.userID !== "undefined") {
                console.log(" User is logged in:", data.userID);
                console.log("username from session: ", data.username)
                window.usernameFromSession = data.username;
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
            return data;
        })
        .catch(error => {
            errorPage(error.status, error.statusText);
            return { loggedIn: false, userID: null };
        });
}

function escapeHTML(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

//handle back or forward
window.addEventListener("popstate", (e) => {
    (async () => { await renderFromState(e.state); })();
});

window.checkSession = checkSession;
window.escapeHTML = escapeHTML;