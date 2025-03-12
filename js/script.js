
document.addEventListener('DOMContentLoaded', () => {
    // Get references to sections
    const mainSection = document.getElementById('mainPage');
    const signUpSection = document.getElementById('signUpSection');
    const logInSection = document.getElementById('logInSection');
    const postPageSection = document.getElementById('postPageSection');
    const createPostSection = document.getElementById('createPostSection');
    const aboutUsSection = document.getElementById('aboutUsSection');

    // Get references to buttons
    const signUpButton = document.getElementById('signUpButton');
    const logInButton = document.getElementById('logInButton');
    const logoutButton = document.getElementById('logoutButton');
    const postsButton = document.getElementById('postsButton');
    const createPostButton = document.getElementById('createPostButton');
    const aboutUsButton = document.getElementById('aboutUsButton');

    // Function to show a section and hide others
    function showSection(sectionToShow, urlSuffix) {
        mainSection.hidden = true;
        signUpSection.hidden = true;
        logInSection.hidden = true;
        postPageSection.hidden = true;
        createPostSection.hidden = true;
        aboutUsSection.hidden = true;
        sectionToShow.hidden = false;

        // Update the URL
        history.pushState(null, '', urlSuffix);
    }

    // Event listeners for navigation buttons
    if (signUpButton) signUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
    if (logInButton) logInButton.addEventListener('click', () => showSection(logInSection, '/login'));
    if (postsButton) postsButton.addEventListener('click', () => showSection(postPageSection, '/posts'));
    if (createPostButton) createPostButton.addEventListener('click', () => showSection(createPostSection, '/create-post'));
    if (aboutUsButton) aboutUsButton.addEventListener('click', () => showSection(aboutUsSection, '/about-us'));

    // ✅ Run session check on page load
    checkSession();

    // ✅ Registration form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            const feedbackMessage = document.getElementById('feedbackMessage');
            feedbackMessage.textContent = '';

            const formData = {
                username: document.getElementById('username').value,
                fname: document.getElementById('fname').value,
                lname: document.getElementById('lname').value,
                email: document.getElementById('email').value,
                age: parseInt(document.getElementById('age').value, 10),
                gender: document.getElementById('gender').value,
                password: document.getElementById('password').value,
            };

            fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        feedbackMessage.textContent = 'Registration successful!';
                        feedbackMessage.style.color = 'green';
                        registrationForm.reset();
                        showSection(logInSection, '/login'); // Navigate to login section
                    } else {
                        feedbackMessage.textContent = data.message || 'Registration failed.';
                        feedbackMessage.style.color = 'red';
                    }
                })
                .catch(error => {
                    feedbackMessage.textContent = 'An error occurred: ' + error.message;
                    feedbackMessage.style.color = 'red';
                });
        });
    }

    // ✅ Login form submission
    const loginForm = document.getElementById('loginForm');
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
                credentials: 'include' // ✅ Allows cookies to be sent with the request
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message == "Login successful.") {
                        checkSession();
                        alert("Login successful!");
                        // Refresh session check to update UI
                        loginForm.reset();
                        showSection(postPageSection, '/posts');
                    } else {
                        checkSession();
                        alert("Login failed: " + data.message);
                        loginForm.reset();
                    }
                })
                .catch(error => alert("An error occurred: " + error.message));
        });
    }

    // ✅ Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    checkSession(); // ✅ Refresh session check to update UI
                })
                .catch(error => console.error("Logout failed:", error));
        });
    }

    // ✅ Dynamically add Sign Up Button in Login Section
    const loginSignUpButton = document.getElementById('signUpButtonLogin');
    if (loginSignUpButton) {
        loginSignUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
    }
});

// ✅ Function to check session and update UI accordingly
function checkSession() {
    fetch('/check-session', {
        method: 'GET',
        credentials: 'include' // ✅ Ensures cookies are sent
    })
        .then(response => response.json())
        .then(data => {
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const logoutButton = document.getElementById('logoutButton');
            const postsButton = document.getElementById('postsButton');

            if (data.loggedIn) {
                console.log("✅ User is logged in:", data.userID);

                // ✅ Hide sign-up & login buttons
                if (signUpButton) signUpButton.style.display = "none";
                if (logInButton) logInButton.style.display = "none";

                // ✅ Show logout & posts buttons
                if (logoutButton) logoutButton.style.display = "inline-block";
                if (postsButton) postsButton.style.display = "inline-block";
            } else {
                console.log("❌ User is not logged in.");
                
                // ✅ Show main menu and sign-up/login buttons
                if (signUpButton) signUpButton.style.display = "inline-block";
                if (logInButton) logInButton.style.display = "inline-block";

                // ✅ Hide logout & posts buttons
                if (logoutButton) logoutButton.style.display = "none";
                if (postsButton) postsButton.style.display = "none";
            }
        })
        .catch(error => console.error("Session check failed:", error));
}

// ✅ Run check on page load
document.addEventListener('DOMContentLoaded', checkSession);
