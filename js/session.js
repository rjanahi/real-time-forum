function checkSession() {

    return fetch('/check-session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const logoutButton = document.getElementById('logoutButton');
            const postsButton = document.getElementById('postsButton');
            const show = document.getElementById('show');


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

                if (window.location.pathname === "/login" || window.location.pathname === "/signup") {
                    showSection(mainSection, "/");
                }

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
            errorPage(500, error);
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
window.addEventListener("popstate", () => {
    const path = window.location.pathname;

    console.log("Popstate event:", path);
    checkSession().then(session => {
        switch (true) {
            case path === "/":
                showSection(mainSection, "/");
                break;
            case path === "/signup":
                if (session && session.loggedIn) {
                    showSection(mainSection, "/");
                    return;
                }
                showSection(signUpSection, "/signup")
                    ;
                break;
            case path === "/login":
                if (session && session.loggedIn) {
                    showSection(mainSection, "/");
                    return;
                }
                showSection(logInSection, "/login");
                break;
            case path === "/posts":
                if (session && !session.loggedIn) {
                    showSection(logInSection, "/login");
                    return;
                }
                showSection(postPageSection, "/posts");
                loadPosts();
                break;
            case path === "/create-post":
                if (session && !session.loggedIn) {
                    showSection(logInSection, "/login");
                    return;
                }
                showSection(createPostSection, "/create-post");
                break;
            case path === "/about-us":
                showSection(aboutUsSection, "/about-us");
                break;
            case /^\/comment\/\d+$/.test(path): { // dynamic comment routes
                const postId = path.split("/").pop();

                if (session && !session.loggedIn) {
                    showSection(logInSection, "/login");
                    return;
                }
                showSection(commentsSection, path);
                loadCommentsForPost(postId)
                break;
            }
            default:
                showSection(mainSection, "/");
        }
    });
});

window.checkSession = checkSession;
window.escapeHTML = escapeHTML;