// Get references to sections
const mainSection = document.getElementById('mainPage');
const signUpSection = document.getElementById('signUpSection');
const logInSection = document.getElementById('logInSection');
const postPageSection = document.getElementById('postPageSection');
const createPostSection = document.getElementById('createPostSection');
const aboutUsSection = document.getElementById('aboutUsSection');
const commentsSection = document.getElementById('commentsSection');

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
const logoutPostButton = document.getElementById('logoutPostButton');
const postMyPageButton = document.getElementById('postMyPageButton');

// Function to show a section and hide others
function showSection(sectionToShow, urlSuffix) {
    mainSection.hidden = true;
    signUpSection.hidden = true;
    logInSection.hidden = true;
    postPageSection.hidden = true;
    createPostSection.hidden = true;
    aboutUsSection.hidden = true;
    commentsSection.hidden = true;
    sectionToShow.hidden = false;

    // Update the URL
    history.pushState(null, '', urlSuffix);
}

// Consolidated event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    // Event listeners for navigation buttons
    if (signUpButton) signUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
    if (logInButton) logInButton.addEventListener('click', () => showSection(logInSection, '/login'));
    if (postsButton) postsButton.addEventListener('click', () => showSection(postPageSection, '/posts'));
   if (createPostButton) createPostButton.addEventListener('click', ()=> showSection(createPostSection, "/create-post"))
    if (aboutUsButton) aboutUsButton.addEventListener('click', () => showSection(aboutUsSection, '/about-us'));
    if (returnToPost) returnToPost.addEventListener('click', () => showSection(postPageSection, '/posts'));

    // Registration form submission
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
                    feedbackMessage.textContent = data.success ? 'Registration successful!' : (data.message || 'Registration failed.');
                    feedbackMessage.style.color = data.success ? 'green' : 'red';
                    if (data.success) {
                        registrationForm.reset();
                        showSection(logInSection, '/login'); // Navigate to login section
                    }
                })
                .catch(error => {
                    feedbackMessage.textContent = 'An error occurred: ' + error.message;
                    feedbackMessage.style.color = 'red';
                });
        });
    }

   // Login form submission
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
            credentials: 'include' // Allows cookies to be sent with the request
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === "Login successful.") {
                checkSession(); // Refresh session check
                loginForm.reset();
                showSection(postPageSection, '/posts'); // Navigate to posts section
                loadPosts(); // Load posts after navigating to the posts section
            } else {
                checkSession(); // Update UI based on session status
                loginForm.reset();
            }
        })
        .catch(error => alert("An error occurred: " + error.message));
    });
}

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                checkSession(); // Refresh session check to update UI
                showSection(mainSection, '/'); // Redirect to main page after logout
            })
            .catch(error => console.error("Logout failed:", error));
        });
    }
    

    // Dynamically add Sign Up Button in Login Section
    if (loginSignUpButton) {
        loginSignUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
    }

    // Post form submission
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
                    alert(data.success ? "Post created successfully!" : "Error: " + data.message);
                    if (data.success) createPostForm.reset();
                    loadPosts();
                    showSection(postPageSection, '/posts');
                })
                .catch(error => alert("An error occurred: " + error.message));
        });
    }

    function loadPosts() {
        fetch('/get-posts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(posts => {
            const postContainer = document.querySelector('.container-post');
            postContainer.innerHTML = '';
            postContainer.innerHTML = '<h1>Posts</h1>';
            
           
            if (!posts.length) {
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
                        <button class="commentsButton button-main" data-post-id="${post.id}">See comments</button>
                    </div>
                `;
                postContainer.appendChild(postElement);
            });
    
            document.querySelectorAll('.commentsButton').forEach(button => {
                button.addEventListener('click', () => loadCommentsForPost(button.dataset.postId));
            });
           
        })
        .catch(error => console.error("Error loading posts:", error));
    }

    function loadMyPosts() {
        fetch('/get-myPosts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(posts => {
            const postContainer = document.querySelector('.container-post');
            postContainer.innerHTML = '';
            postContainer.innerHTML += '<h1>Posts</h1>';
            
           
            if (!posts.length) {
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
                        <button class="commentsButton button-main" data-post-id="${post.id}">See comments</button>
                    </div>
                `;
                postContainer.appendChild(postElement);
            });
    
            document.querySelectorAll('.commentsButton').forEach(button => {
                button.addEventListener('click', () => loadCommentsForPost(button.dataset.postId));
            });
           
        })
        .catch(error => console.error("Error loading posts:", error));
    }


    
    if (logoutPostButton) {
        logoutPostButton.addEventListener('click', function () {
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                checkSession(); // Refresh UI
                showSection(mainSection, '/'); // Redirect to main page
            })
            .catch(error => console.error("Logout failed:", error));
        });
    }

function loadCommentsForPost(postId) {
    fetch(`/comments?post_id=${postId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(response => response.text()) // Read response as text first
    .then(text => {
        console.log("📥 Raw Response:", text);
        try {
            const parsedResponse = JSON.parse(text);

            // Handle case where response contains an error
            if (parsedResponse.error) {
                console.error("❌ Server Error:", parsedResponse.error);
                commentsSection.innerHTML = `<p>Error loading comments: ${parsedResponse.error}</p>`;
                return;
            }
            const post = parsedResponse.post; // Accessing post from the parsed response
        const comments = parsedResponse.comments; // Accessing comments from the parsed response
        commentsSection.innerHTML = `
        <button id="return-to-posts" class="return-button">Return</button>
        <div class="comment-post">
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <small>Posted by <strong>${post.username}</strong> on ${post.createdAt}</small>
        </div>
        <div class="container-about">
            <h2>Comments</h2>
            <div id="commentsList"></div>
            <form id="commentForm">
                <textarea id="commentText" name="comment" placeholder="Write your comment here..." required></textarea><br><br>
                <input type="hidden" id="postID" value="${postId}"><br><br>
                <button id="sendCommentButton" class="button-main" type="submit">Post Comment</button>
            </form>
        </div>
    `;

           
            if (comments.length === 0) {
                commentsList.innerHTML = "<p>No comments available for this post.</p>";
            } else {
                comments.forEach(comment => {
                    let formattedDate = "Unknown Date";
                    if (comment.created_at) { // Use created_at instead of createdAt
                        try {
                            const date = new Date(comment.created_at); // Correctly parse the created_at field
                            // Check if the date is valid
                            if (!isNaN(date)) {
                                formattedDate = date.toLocaleString(); // Formats date and time
                            } else {
                                console.error("❌ Invalid Date:", comment.created_at);
                            }
                        } catch (error) {
                            console.error("❌ Error parsing date:", error);
                        }
                    }
                
                    commentsList.innerHTML += `
                        <div class="comment">
                            <p><strong>${comment.username}:</strong> ${comment.content}</p>
                            <small>Commented on ${formattedDate}</small>
                        </div>
                    `;
                });
            }

            // ✅ Stay on the comments page
            showSection(commentsSection, `/comment/${postId}`);

            if(document.getElementById("return-to-posts")){
                document.getElementById("return-to-posts").addEventListener('click', () => {
                showSection(postPageSection, `/posts`);
                loadPosts(); // ✅ Ensure posts are loaded
            });
            }
            
            

            // Attach the event listener for submitting a comment
            document.getElementById('commentForm').addEventListener('submit', function (event) {
                event.preventDefault();  // Prevent default form submission
        
                const commentText = document.querySelector("#commentText").value.trim();
                const postID = document.querySelector("#postID").value;
        
                if (!commentText) {
                    // alert("Comment cannot be empty.");
                    return;
                }
        
                const requestBody = JSON.stringify({ post_id: parseInt(postID), content: commentText });
        
                console.log("📤 Sending JSON Data:", requestBody);
        
                fetch("/create-comment", {
                    method: "POST",
                    headers: { 
                        "Accept": "application/json",  // ✅ Ensure JSON response
                        "Content-Type": "application/json"  // ✅ Ensure JSON request
                    },
                    credentials: "include",
                    body: requestBody
                })
                .then(response => {
                    console.log("📥 Response Headers:", response.headers.get("Content-Type"));
                    return response.json();
                })
                .then(data => {
                    console.log("✅ Server Response:", data);
                    // alert(data.success ? "Comment posted successfully!" : "Error: " + data.message);

                    // ✅ Reload comments without redirecting away
                    if (data.success) loadCommentsForPost(postID);
                    
                })
                .catch(error => console.error("❌ Error posting comment:", error));
            });
            

        } catch (error) {
            console.error("❌ JSON Parsing Error:", error);
            commentsSection.innerHTML = "<p>Failed to load comments.</p>";
        }
    })
    .catch(error => {
        console.error("❌ Error loading comments:", error);
        commentsSection.innerHTML = "<p>Failed to load comments.</p>";
    });
    

}
if(postMyPageButton)postMyPageButton.addEventListener('click',loadMyPosts);
if(postsPageButton)postsPageButton.addEventListener('click',loadPosts);


    postsButton.addEventListener('click', () => {
        checkSession();
        loadPosts();
    });
});

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
