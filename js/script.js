// Get references to sections
const mainSection = document.getElementById('mainPage');
const signUpSection = document.getElementById('signUpSection');
const logInSection = document.getElementById('logInSection');
const postPageSection = document.getElementById('postPageSection');
const createPostSection = document.getElementById('createPostSection');
const aboutUsSection = document.getElementById('aboutUsSection');
const commentsSection = document.getElementById('commentsSection');
const errorSection = document.getElementById('errorSection');

// Get references to buttons
const signUpButton = document.getElementById('signUpButton');
const logInButton = document.getElementById('logInButton');
const logoutButton = document.getElementById('logoutButton');
const postsButton = document.getElementById('postsButton');
const postsPageButton = document.getElementById('postsPageButton');
const createPostButton = document.getElementById('createPostButton');
const aboutUsButton = document.getElementById('aboutUsButton');
const returnToPost = document.getElementById("return-to-post");
const sendCommentButton = document.getElementById("sendCommentButton");
const loginSignUpButton = document.getElementById('signUpButtonLogin');
const postMyPageButton = document.getElementById('postMyPageButton');
const categoryButtons = document.querySelectorAll('#categoryOptions .button-side');
const chatButton = document.getElementById('chatButton');

let userID = 0;
let Chatusername;

function showSection(sectionToShow, urlSuffix, state = {}, opts = {}) {
    const { replace = false, updateHistory = true } = opts;

    sessionStorage.setItem("prevPath", window.location.pathname);

    // hide all
    errorSection.hidden = true;
    mainSection.hidden = true;
    signUpSection.hidden = true;
    logInSection.hidden = true;
    postPageSection.hidden = true;
    createPostSection.hidden = true;
    aboutUsSection.hidden = true;
    commentsSection.hidden = true;

    // show target
    sectionToShow.hidden = false;

    // history entry with useful state
    if (updateHistory) {
        if (replace) history.replaceState(state, "", urlSuffix);
        else history.pushState(state, "", urlSuffix);
    }
}

// --- Simple renderer that DOES NOT push history (used by popstate) ---
async function renderFromState(state) {
    if (!state || !state.route) {
        routeByPath(location.pathname); // fallback to URL parsing
        return;
    }
    let session = await checkSession();
    console.log("Rendering state:", state, "with session:", session);

    switch (state.route) {
        case "home":
            showSection(mainSection, "/", state, { updateHistory: false });
            break;

        case "posts":
            if (!session || !session.loggedIn) {
                showSection(logInSection, "/login", { route: "login" }, { replace: true });
                return;
            }
            showSection(postPageSection, "/posts", state, { updateHistory: false });
            loadPosts();
            break;

        case "myPosts":
            if (!session || !session.loggedIn) {
                showSection(logInSection, "/login", { route: "login" }, { replace: true });
                return;
            }
            showSection(postPageSection, "/myPosts", state, { updateHistory: false });
            loadMyPosts();
            break;

        case "createPost":
            if (!session || !session.loggedIn) {
                showSection(logInSection, "/login", { route: "login" }, { replace: true });
                return;
            }
            showSection(createPostSection, "/create-post", state, { updateHistory: false });
            break;

        case "login":
            if (session && session.loggedIn) {
                showSection(mainSection, "/", { route: "home" }, { replace: true });
                return;
            }
            showSection(logInSection, "/login", state, { updateHistory: false });
            break;

        case "signup":
            if (session && session.loggedIn) {
                showSection(mainSection, "/", { route: "home" }, { replace: true });
                return;
            }
            showSection(signUpSection, "/signup", state, { updateHistory: false });
            break;

        case "about-us":
            showSection(aboutUsSection, "/about-us", state, { updateHistory: false });
            break;

        case "comment":
            if (!session || !session.loggedIn) {
                showSection(logInSection, "/login", { route: "login" }, { replace: true });
                return;
            }
            showSection(commentsSection, `/comment/${state.postId}`, state, { updateHistory: false });
            loadCommentsForPost(state.postId);
            break;

        case "category":
            if (!session || !session.loggedIn) {
                showSection(logInSection, "/login", { route: "login" }, { replace: true });
                return;
            }
            showSection(postPageSection, `/category/${state.category}`, state, { updateHistory: false });
            loadCategoryPosts(state.category);
            break;

        default:
            if (!session || !session.loggedIn) {
                showSection(logInSection, "/login", { route: "login" }, { replace: true });
                return;
            }
            await routeByPath(location.pathname);
    }
}

// --- Fallback: parse URL when there is no state (e.g., hard refresh) ---
async function routeByPath(path) {
    if (path === "/") return renderFromState({ route: "home" });
    if (path === "/posts") return renderFromState({ route: "posts" });
    if (path === "/myPosts") return renderFromState({ route: "myPosts" });
    if (path === "/create-post") return renderFromState({ route: "createPost" });
    if (path === "/login") return renderFromState({ route: "login" });
    if (path === "/signup") return renderFromState({ route: "signup" });
    if (path === "/about-us") return renderFromState({ route: "about-us" });

    if (path.startsWith("/comment/")) {
        const postId = path.split("/").pop();
        return renderFromState({ route: "comment", postId });
    }
    if (path.startsWith("/category/")) {
        const category = decodeURIComponent(path.split("/").pop());
        return renderFromState({ route: "category", category });
    }

    return renderFromState({ route: "home" });
}

async function refresh() {
    const initialState = routeByPath(location.pathname);
    // render based on that state (awaits checkSession inside)
    await renderFromState(initialState);
}

document.addEventListener('DOMContentLoaded', () => {
    refresh();
    checkSession();
    if (postsButton) {
        postsButton.addEventListener('click', () => {
            checkSession().then(session => {
                if (session.loggedIn) {
                    showSection(postPageSection, '/posts');
                    loadPosts();
                }

            })
        });
    }
    if (createPostButton) createPostButton.addEventListener('click', () => {
        checkSession().then(session => {
            if (session.loggedIn) {
                showSection(createPostSection, "/create-post")
            }
        })
    });

    if (postMyPageButton) postMyPageButton.addEventListener('click', () => {
        checkSession().then(session => {
            if (session.loggedIn) {
                showSection(postPageSection, '/myPosts');
                loadMyPosts();
            }
        })
    });

    if (postsPageButton) {
        postsPageButton.addEventListener('click', () => {
            checkSession().then(session => {
                if (session.loggedIn) {
                    showSection(postPageSection, '/posts');
                    loadPosts();
                }
            });
        })
    };

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            checkSession().then(session => {
                if (session.loggedIn) {
                    const category = button.value; // Get the category from the button's value
                    loadCategoryPosts(category);
                    showSection(postPageSection, '/category/' + category); // Show posts of the selected category
                };
            });

        });
    });

    if (chatButton) chatButton.addEventListener('click', () => {
        checkSession().then(session => {
            if (session.loggedIn) {
                let users = document.getElementById('userList');
                if (users.style.display === 'none' || users.style.display === '') {
                    users.style.display = 'block';
                } else {
                    users.style.display = 'none';
                }
            }
        })
    });

    // Create form submission
    const createPostForm = document.getElementById('createPostForm');

    //Create form
    if (createPostForm) {
        createPostForm.addEventListener('submit', function (event) {

            event.preventDefault(); // Prevent default form submission

            checkSession().then(session => {
                if (!session.loggedIn) {
                    console.warn("User not logged in. Cannot create post.");
                    showSection(logInSection, '/login');
                    return;
                }
            });
            // Get selected categories (checkboxes)
            const selectedCategories = [];
            document.querySelectorAll('input[name="category"]:checked').forEach((checkbox) => {
                selectedCategories.push(checkbox.value);
            });

            const postData = {
                title: document.getElementById('title').value,
                content: document.getElementById('content').value,
                categories: selectedCategories // Send array of selected categories
            };

            fetch('/create-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
                credentials: 'include' // Ensures session cookies are sent
            })
                .then(response => {
                    if (!response.ok) {
                        errorPage(response.status, response.statusText);
                        throw response;
                    }
                    return response.json()
                })
                .then(data => {
                    console.log(data.success ? "Post created successfully!" : "Error: " + data.message);
                    if (data.success) createPostForm.reset();
                    socket.send(JSON.stringify({ type: "new_post" }));
                    showSection(postPageSection, '/posts');
                })
                .catch(error => errorPage(error.status, error.statusText));
        });
    }


});

// Logout functionality
if (logoutButton) {
    logoutButton.addEventListener('click', function () {

        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    errorPage(response.status, response.statusText);
                    throw response;
                }
                return response.json()
            })
            .then(data => {
                console.log(data.message);
                disconnectWeb();
                socket.send(JSON.stringify({ type: "new_user" }));
                checkSession().then(() => {
                    showSection(mainSection, '/');
                });

            })
            .catch(error => errorPage(error.status, error.statusText));
    });
}
if (aboutUsButton) aboutUsButton.addEventListener('click', () => showSection(aboutUsSection, '/about-us'));
// Event listeners for navigation buttons
if (signUpButton) signUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
if (logInButton) logInButton.addEventListener('click', () => showSection(logInSection, '/login'));

if (loginSignUpButton) loginSignUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));


// Registration form
const registrationForm = document.getElementById('registrationForm');

// Login form 
const loginForm = document.getElementById('loginForm');

// Registration form 
if (registrationForm) {
    registrationForm.addEventListener('submit', function (event) {

        event.preventDefault(); // Prevent default form submission

        const feedbackMessage = document.getElementById('feedbackMessage');
        feedbackMessage.textContent = '';

        const formData = {
            username: escapeHTML(document.getElementById('username').value),
            fname: escapeHTML(document.getElementById('fname').value),
            lname: escapeHTML(document.getElementById('lname').value),
            email: escapeHTML(document.getElementById('email').value),
            age: parseInt(document.getElementById('age').value, 10),
            gender: document.getElementById('gender').value,
            password: document.getElementById('password').value,
        };


        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 400) {
                        return response.json();
                    }
                    errorPage(response.status, response.statusText);
                    throw response;
                }
                return response.json()
            })
            .then(data => {
                feedbackMessage.textContent = data.success ? 'Registration successful!' : (data.message || 'Registration failed.');
                feedbackMessage.style.color = data.success ? 'green' : 'red';
                if (data.success) {
                    feedbackMessage.textContent = '';
                    registrationForm.reset();
                    showSection(logInSection, '/login'); // Navigate to login section
                }
            })
            .catch(error => {
                feedbackMessage.textContent = 'An error occurred: ' + error.message;
                feedbackMessage.style.color = 'red';
                errorPage(error.status, error.statusText);
            });
    });
}

// Login form 
if (loginForm) {
    loginForm.addEventListener('submit', function (event) {

        event.preventDefault(); // Prevent default form submission

        const loginData = {
            userOremail: document.getElementById('userOremail').value,
            password: document.getElementById('pass').value
        };

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
            credentials: 'include' // Allows cookies to be sent with the request
        })
            .then(response => {
                if (!response.ok) {
                    errorPage(response.status, response.statusText);
                    throw response;
                }
                return response.json()
            })
            .then(data => {
                console.log(data.message);
                if (data.message === "Login successful.") {
                    Chatusername = data.username;
                    window.Chatusername = Chatusername;
                    console.log("Chatusername:", data.username);
                    checkSession(); // Refresh session check
                    loginForm.reset();
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "new_user" }));
                    }
                    showSection(mainSection, '/'); // Navigate to posts section
                } else {
                    const error = document.getElementById("logerror")
                    error.innerHTML = data.message;
                    checkSession(); // Update UI based on session status
                    loginForm.reset();
                }
            })
            .catch(error => errorPage(error.status, error.statusText));
    });
}

function toggleDropdown(id) {
    var dropdown = document.getElementById(id);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; // Toggle visibility
}

window.renderFromState = renderFromState;
window.routeByPath = routeByPath;
