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
const categoryButtons = document.querySelectorAll('#categoryOptions .button-side');

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
    if (postsButton){ 
        postsButton.addEventListener('click', () => showSection(postPageSection, '/posts'));
        checkSession();
        loadPosts();
    }
    if (createPostButton) createPostButton.addEventListener('click', ()=> showSection(createPostSection, "/create-post"))
    if (aboutUsButton) aboutUsButton.addEventListener('click', () => showSection(aboutUsSection, '/about-us'));
    if (returnToPost) returnToPost.addEventListener('click', () => showSection(postPageSection, '/posts'));
    if (loginSignUpButton) loginSignUpButton.addEventListener('click', () => showSection(signUpSection, '/signup'));
    if(postMyPageButton)postMyPageButton.addEventListener('click',loadMyPosts);
    if(postsPageButton)postsPageButton.addEventListener('click',loadPosts); 
    if (logoutPostButton) {
        logoutPostButton.addEventListener('click', function () {
            fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                checkSession(); // Refresh UI
                showSection(mainSection, '/'); // Redirect to main page
            })
            .catch(error => console.error("Logout failed:", error));
        });
    }
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.value; // Get the category from the button's value
            loadCategoryPosts(category);
        });
    });

    // Registration form
    const registrationForm = document.getElementById('registrationForm');

   // Login form 
   const loginForm = document.getElementById('loginForm');
   
    // Create form submission
    const createPostForm = document.getElementById('createPostForm');

   // Registration form 
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
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
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

    //Create form
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
                    console.log(data.success ? "Post created successfully!" : "Error: " + data.message);
                    if (data.success) createPostForm.reset();
                    loadPosts();
                    showSection(postPageSection, '/posts');
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
                console.log(data.message);
                checkSession(); // Refresh session check to update UI
                showSection(mainSection, '/'); // Redirect to main page after logout
            })
            .catch(error => console.error("Logout failed:", error));
        });
    }
    

    //load all the posts
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
            
           
            if (posts == null) {
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
                        <small>Posted by <strong>${post.username}</strong> on ${post.createdAt}</small><br>
                        <small>Category: ${post.categories.join(", ")}</small>
                        <br><br>
                        <button class="commentsButton button-main" data-post-id="${post.id}">See comments</button>
                        <br><br>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, true); this.style.color = 'green'"> thumb_up </span>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, false); this.style.color = 'red'"> thumb_down </span>
<small>
                        <span id="likesCountPost${post.id}">Likes: 0</span>
                        <span id="dislikesCountPost${post.id}">Dislikes: 0</span>
                    </small>                    </div>
                `;
                postContainer.appendChild(postElement);
                 //  Fetch updated likes/dislikes for this post
            getInteractions(post.id);
            });
    
            document.querySelectorAll('.commentsButton').forEach(button => {
                button.addEventListener('click', () => loadCommentsForPost(button.dataset.postId));
            });
           
        })
        .catch(error => console.error("Error loading posts:", error));
    }

    //load only user posts
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
            
           
            if (posts == null) {
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
                        <small>Posted by <strong>${post.username}</strong> on ${post.createdAt}</small><br>
                        <small>Category: ${post.categories.join(", ")}</small>
                        <br><br>
                        <button class="commentsButton button-main" data-post-id="${post.id}">See comments</button>
                        <br><br>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, true); this.style.color = 'green'"> thumb_up </span>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, false); this.style.color = 'red'"> thumb_down </span>
<small>
                        <span id="likesCountPost${post.id}">Likes: 0</span>
                        <span id="dislikesCountPost${post.id}">Dislikes: 0</span>
                    </small>                    </div>
                `;
                postContainer.appendChild(postElement);
                 //  Fetch updated likes/dislikes for this post
            getInteractions(post.id);
            });
    
            document.querySelectorAll('.commentsButton').forEach(button => {
                button.addEventListener('click', () => loadCommentsForPost(button.dataset.postId));
            });
           
        })
        .catch(error => console.error("Error loading posts:", error));
    }

    //load posts with specific category
    function loadCategoryPosts(category) {
        fetch('/category/' + category, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(posts => {
            const postContainer = document.querySelector('.container-post');

            // Debugging: Log the postContainer to check if it's null
            console.log('Post container:', postContainer);

            // Check if postContainer is null
            if (!postContainer) {
                console.error("Post container not found!");
                return;
            }

            postContainer.innerHTML = ''; // Clear previous posts
            postContainer.innerHTML += '<h1>Posts</h1>';
            
            if (!Array.isArray(posts)) {
                console.error("Expected posts to be an array, but got:", posts);
                postContainer.innerHTML += "<p>Error loading posts.</p>";
                return;
            }

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
                        <small>Posted by <strong>${post.username}</strong> on ${post.createdAt}</small><br>
                        <small>Category: ${post.categories.join(", ")}</small>
                        <br><br>
                        <button class="commentsButton button-main" data-post-id="${post.id}">See comments</button>
                        <br><br>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, true); this.style.color = 'green'"> thumb_up </span>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, false); this.style.color = 'red'"> thumb_down </span><small>
                        <span id="likesCountPost${post.id}">Likes: 0</span>
                        <span id="dislikesCountPost${post.id}">Dislikes: 0</span></small>
                        </div>
                        `;
                postContainer.appendChild(postElement);
                 //  Fetch updated likes/dislikes for this post
            getInteractions(post.id);
            });

            document.querySelectorAll('.commentsButton').forEach(button => {
                button.addEventListener('click', () => loadCommentsForPost(button.dataset.postId));
            });
        })
        .catch(error => console.error("Error loading posts:", error));
    }


    function loadCommentsForPost(postId) {
        fetch(`/comments?post_id=${postId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(parsedResponse => {
            console.log("📥 Server Response:", parsedResponse);
    
            // Handle server errors
            if (parsedResponse.error) {
                console.error("❌ Server Error:", parsedResponse.error);
                commentsSection.innerHTML = `<p>Error loading comments: ${parsedResponse.error}</p>`;
                return;
            }
    
            // Extract post and comments
            const post = parsedResponse.post;
            const comments = parsedResponse.comments;
    
            // ✅ Update the full comment section (only when switching posts)
            commentsSection.innerHTML = `
                <button id="return-to-posts" class="return-button">Return</button>
                <div class="comment-post">
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <small>Posted by <strong>${post.username}</strong> on ${post.createdAt}</small>
                </div>
                <div class="container-about">
                    <h2>Comments</h2>
                    <div id="commentsList"></div> <!-- This holds the comments only -->
                    <form id="commentForm">
                        <textarea id="commentText" name="comment" placeholder="Write your comment here..." required></textarea><br><br>
                        <input type="hidden" id="postID" value="${postId}"><br><br>
                        <button id="sendCommentButton" class="button-main" type="submit">Post Comment</button>
                    </form>
                </div>
            `;
    
            // ✅ Get the newly created commentsList div
            const commentsList = document.getElementById("commentsList");
    
            // ✅ Populate comments
            if (comments.length === 0) {
                commentsList.innerHTML = "<p>No comments available for this post.</p>";
            } else {
                comments.forEach(comment => {
                    console.log("✅ Loaded Comment ID:", comment.id);
    
                    let formattedDate = "Unknown Date";
                    if (comment.created_at) {
                        try {
                            const date = new Date(comment.created_at);
                            formattedDate = isNaN(date) ? "Invalid Date" : date.toLocaleString();
                        } catch (error) {
                            console.error("❌ Error parsing date:", error);
                        }
                    }
    
                    commentsList.innerHTML += `
                        <div id="comment-${comment.id}">
                            <p><strong>${comment.username}:</strong> ${comment.content}
                            <small>${formattedDate}</small></p>
                            <span class="material-icons" id="likeComment${comment.id}" onclick="likeDislikeComment(${comment.id}, true)"> thumb_up </span>
                            <span id="likesCountComment${comment.id}">0</span>
                            <span class="material-icons" id="dislikeComment${comment.id}" onclick="likeDislikeComment(${comment.id}, false)"> thumb_down </span>
                            <span id="dislikesCountComment${comment.id}">0</span>
                        </div>
                    `;
                });
            }
    
            // ✅ Show the comment section
            showSection(commentsSection, `/comment/${postId}`);
    
            // ✅ Attach event listener for returning to posts
            document.getElementById("return-to-posts").addEventListener('click', () => {
                showSection(postPageSection, `/posts`);
                loadPosts(); // Ensure posts are loaded
            });
    
            // ✅ Attach event listener for submitting a comment
            document.getElementById('commentForm').addEventListener('submit', function (event) {
                event.preventDefault();  // Prevent default form submission
    
                const commentText = document.getElementById("commentText").value.trim();
                if (!commentText) {
                    console.log("❌ Comment cannot be empty.");
                    return;
                }
    
                const requestBody = JSON.stringify({ post_id: parseInt(postId), content: commentText });
                console.log("📤 Sending JSON Data:", requestBody);
    
                fetch("/create-comment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: requestBody
                })
                .then(response => response.json())
                .then(data => {
                    console.log("✅ Server Response:", data);
                    if (data.success) loadCommentsForPost(postId); // Reload comments
                })
                .catch(error => console.error("❌ Error posting comment:", error));
            });
        })
        .catch(error => {
            console.error("❌ Error loading comments:", error);
            commentsSection.innerHTML = "<p>Failed to load comments.</p>";
        });
    }
       
});

function likeDislikeComment(commentId, isLike) {
    console.log(`📤 Sending Like/Dislike request for Comment ID: ${commentId}, Is Like: ${isLike}`);

    let likesElement = document.getElementById(`likesCountComment${commentId}`);
    let dislikesElement = document.getElementById(`dislikesCountComment${commentId}`);

    if (!likesElement || !dislikesElement) {
        console.error(` Elements for comment ${commentId} not found.`);
        return;
    }

    fetch('/likeDislikeComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, is_like: isLike }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log(" Like/Dislike Comment Response:", data);

        if (data.message === 'Interaction updated successfully') {
            likesElement.innerText = `Likes: ${data.likes}`;
            dislikesElement.innerText = `Dislikes: ${data.dislikes}`;
        } else {
            console.log(data.error || "Something went wrong.");
        }
    })
    .catch(error => console.error(' Error:', error));
}

function likeDislikePost(postId, isLike) {
    let likesElement = document.getElementById(`likesCountPost${postId}`);
    let dislikesElement = document.getElementById(`dislikesCountPost${postId}`);

    if (!likesElement || !dislikesElement) {
        console.error(` Elements for post ${postId} not found.`);
        return;
    }

    fetch('/likeDislikePost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, is_like: isLike }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log(" Like/Dislike Response:", data);

        if (data.message === 'Interaction updated successfully') {
            //  Update UI only after getting the correct values from backend
            likesElement.innerText = `Likes: ${data.likes}`;
            dislikesElement.innerText = `Dislikes: ${data.dislikes}`;
        } else {
            console.log(data.error || "Something went wrong.");
        }
    })
    .catch(error => {
        console.error(' Error:', error);
    });
}



function getInteractions(postId) {
    fetch('/getInteractions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
        cache: "no-cache" //  Ensure fresh data
    })
    .then(response => response.json())
    .then(data => {
        console.log(" Updated Interaction Data:", data);

        //  Ensure data exists
        if (!data || typeof data.likes === "undefined" || typeof data.dislikes === "undefined") {
            console.error(" Invalid data received:", data);
            return;
        }

        //  Ensure elements exist before updating
        let likesElement = document.getElementById(`likesCountPost${postId}`);
        let dislikesElement = document.getElementById(`dislikesCountPost${postId}`);

        if (likesElement) {
            likesElement.innerText = `Likes: ${data.likes}`;
        } else {
            console.error(` Element not found: likesCountPost${postId}`);
        }

        if (dislikesElement) {
            dislikesElement.innerText = `Dislikes: ${data.dislikes}`;
        } else {
            console.error(` Element not found: dislikesCountPost${postId}`);
        }
    })
    .catch(error => console.error(' Error fetching likes/dislikes:', error));
}

function checkSession() {
    fetch('/check-session', {
        method: 'GET',
        credentials: 'include' //  Ensures cookies are sent
    })
        .then(response => response.json())
        .then(data => {
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const logoutButton = document.getElementById('logoutButton');
            const postsButton = document.getElementById('postsButton');

            if (data.loggedIn) {
                console.log(" User is logged in:", data.userID);

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

                //  Hide logout & posts buttons
                if (logoutButton) logoutButton.style.display = "none";
                if (postsButton) postsButton.style.display = "none";
            }
        })
        .catch(error => console.error("Session check failed:", error));
}

function toggleDropdown(id) {
    var dropdown = document.getElementById(id);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; // Toggle visibility
}

