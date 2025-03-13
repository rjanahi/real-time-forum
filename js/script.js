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
    const returnToPost = document.getElementById("return-to-post");

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

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for navigation buttons
    if (signUpButton) signUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
    if (logInButton) logInButton.addEventListener('click', () => showSection(logInSection, '/login'));
    if (postsButton) postsButton.addEventListener('click', () => showSection(postPageSection, '/posts'));
    if (createPostButton) {
        console.log("✅ Create Post Button Found");
        createPostButton.addEventListener('click', () => {
            console.log("🟢 Create Post Button Clicked");
            showSection(createPostSection, '/create-post');
        });
    } else {
        console.log("❌ Create Post Button NOT Found in the DOM");
    }
    if (aboutUsButton) aboutUsButton.addEventListener('click', () => showSection(aboutUsSection, '/about-us'));
    if (returnToPost) returnToPost.addEventListener('click', () => showSection(postPageSection, '/posts'));

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

// ✅ Post form submission
document.addEventListener('DOMContentLoaded', () => {
    const createPostForm = document.getElementById('createPostForm');
    
    if (createPostForm) {
        createPostForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

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
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Post created successfully!");
                        createPostForm.reset();
                    } else {
                        alert("Error: " + data.message);
                    }
                })
                .catch(error => alert("An error occurred: " + error.message));
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const postContainer = document.querySelector('.container-post');

    function loadPosts() {
        fetch('/get-posts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(posts => {
            const postContainer = document.querySelector('.container-post');
            postContainer.innerHTML = `
                <h1>Posts</h1>
                <button id="createPostButton" class="button-main">Create Post</button>
                <br>
            `;

            // ✅ Re-add event listener after recreating the button
        document.getElementById('createPostButton').addEventListener('click', () => {
            showSection(document.getElementById('createPostSection'), '/create-post');
        });
        

        if (posts.length === 0) {
            postContainer.innerHTML += "<p>No posts available.</p>";
            return;
        }

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post-post');

                postElement.innerHTML = `
                    <div class="comment-post">
                        <h2>${post.title}</h2>
                        <p>${post.content}</p>
                        <small>Posted by <strong>${post.username}</strong> on ${post.createdAt}</small>
                        <br><br>

                        <p>Comments:</p>
                        <div class="comment-item-post">
                            <small>No comments yet.</small>
                            <div class="space-post-post"></div>
                        </div>

                        <form action="/comment" method="post">
                            <input type="hidden" name="postID" value="${post.id}">
                            <textarea name="content" maxlength="100" required></textarea>
                            <button class="Submit" type="submit">Post it</button>
                        </form>
                        <br>

                        <span class="material-icons-post"> thumb_up </span>
                        <span class="material-icons-post"> thumb_down </span>

                        <small>
                            <span id="likesCountPost">Likes: 0</span> 
                            <span id="dislikesCountPost">Dislikes: 0</span>
                        </small>
                    </div>
                `;

                postContainer.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error("❌ Error loading posts:", error);
            postContainer.innerHTML += "<p>Failed to load posts.</p>";
        });
    }

    // Load posts when navigating to the posts page
    document.getElementById('postsButton').addEventListener('click', () => {
        loadPosts();
    });

    // Load posts when the page initially loads (if needed)
    if (window.location.pathname === '/posts') {
        loadPosts();
    }
});



// ✅ Run check on page load
document.addEventListener('DOMContentLoaded', checkSession);
