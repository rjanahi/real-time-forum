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
const logoutPostButton = document.getElementById('logoutPostButton');
const postMyPageButton = document.getElementById('postMyPageButton');
const categoryButtons = document.querySelectorAll('#categoryOptions .button-side');
const openChatButton = document.getElementById('openChatButton');

let userID = 0;
let Chatusername;

// Function to show a section and hide others
function showSection(sectionToShow, urlSuffix) {
    errorSection.hidden = true;
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
    loadAndInitChat(userID); // Your custom chat setup function
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
                disconnectWeb();
                checkSession(); // Refresh UI
                showSection(mainSection, '/'); // Redirect to main page
            })
            .catch(error => errorPage(500));
        });
    }
    if (openChatButton) {
        openChatButton.addEventListener('click', () => {
            showSection(document.getElementById('chatSection'), '/chat');
            loadAndInitChat(userID); // Your custom chat setup function
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
            if (isErrorState) {
                console.warn("Cannot send data; application is in an error state.");
                return; // Exit if in error state
            }
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
                    errorPage(500)
                });
        });
    }

    // Login form 
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            if (isErrorState) {
                console.warn("Cannot send data; application is in an error state.");
                return; // Exit if in error state
            }
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
                    Chatusername = data.username;
                    checkSession(); // Refresh session check
                    loginForm.reset();
                    showSection(postPageSection, '/posts'); // Navigate to posts section
                    loadPosts(); // Load posts after navigating to the posts section
                } else {
                    const error =  document.getElementById("logerror")
                    error.innerHTML = data.message;
                    checkSession(); // Update UI based on session status
                    loginForm.reset();
                }
            })
            .catch(error => errorPage(500));
        });
    }

    //Create form
    if (createPostForm) {
        createPostForm.addEventListener('submit', function (event) {
            if (isErrorState) {
                console.warn("Cannot send data; application is in an error state.");
                return; // Exit if in error state
            }
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
                .catch(error => errorPage(500));
        });
    }
    
    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            if (isErrorState) {
                console.warn("Cannot send data; application is in an error state.");
                return; // Exit if in error state
            }
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
            .catch(error => errorPage(500));
        });
    }
    
    //load all the posts
    function loadPosts() {
        if (isErrorState) {
            console.warn("Cannot send data; application is in an error state.");
            return; // Exit if in error state
        }
        fetch('/get-posts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (response.status === 404) {
                errorPage(404); // Handle posts not found
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            return response.json();
        })
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
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, true); "> thumb_up </span>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, false); "> thumb_down </span>
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
        .catch(error => errorPage(500));
    }

    //load only user posts
    function loadMyPosts() {
        if (isErrorState) {
            console.warn("Cannot send data; application is in an error state.");
            return; // Exit if in error state
        }
        fetch('/get-myPosts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (response.status === 404) {
                errorPage(404); // Handle posts not found
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            return response.json();
        })
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
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, true);"> thumb_up </span>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, false);"> thumb_down </span>
                        <small>
                            <span id="likesCountPost${post.id}">Likes: 0</span>
                            <span id="dislikesCountPost${post.id}">Dislikes: 0</span>
                        </small>                    
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
        .catch(error =>  errorPage(500));
    }

    //load posts with specific category
    function loadCategoryPosts(category) {
        if (isErrorState) {
            console.warn("Cannot send data; application is in an error state.");
            return; // Exit if in error state
        }
        fetch('/category/' + category, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (response.status === 404) {
                errorPage(404); // Handle category not found
                return;
            }
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
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, true);"> thumb_up </span>
                        <span class="material-icons" onclick="likeDislikePost(${post.id}, false);"> thumb_down </span><small>
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
        .catch(error =>  errorPage(500));
    }

    function loadCommentsForPost(postId) {
        if (isErrorState) {
            console.warn("Cannot send data; application is in an error state.");
            return; // Exit if in error state
        }
        fetch(`/comments?post_id=${postId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(response => {
            if (response.status === 404) {
                errorPage(404); // Handle comments not found
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            return response.json();
        })
        .then(parsedResponse => {
            console.log(" Server Response:", parsedResponse);
    
            if (parsedResponse.error) {
                console.error(" Server Error:", parsedResponse.error);
                commentsSection.innerHTML = `<p>Error loading comments: ${parsedResponse.error}</p>`;
                return;
            }
    
            const post = parsedResponse.post;
            const comments = parsedResponse.comments;
    
            commentsSection.innerHTML = `
                <button id="return-to-posts" class="return-button">Return</button>
                <div class="comment-post">
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <small>Posted by <strong>${post.username}</strong> on ${post.createdAt} - ${post.categories.join(', ')} </small>
                </div>
                <div class="container-about">
                    <h2>Comments</h2>
                    <div id="commentsList"></div><br><br>
                    <form id="commentForm">
                        <textarea id="commentText" name="comment" placeholder="Write your comment here..." required></textarea><br>
                        <input type="hidden" id="postID" value="${postId}">
                        <button id="sendCommentButton" class="button-main" type="submit">Post Comment</button>
                    </form>
                </div>
            `;

    
            const commentsList = document.getElementById("commentsList");
    
            if (comments.length === 0) {
                commentsList.innerHTML = "<p>No comments available for this post.</p>";
            } else {
                comments.forEach(comment => {
                    console.log(" Loaded Comment ID:", comment.id);
    
                    let formattedDate = new Date(comment.created_at).toLocaleString();
    
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
    
                    //  Fetch and update likes/dislikes for each comment
                    getInteractions(null, comment.id);
                });
            }
    
            
            showSection(commentsSection, `/comment/${postId}`);

            if(document.getElementById("return-to-posts")){
                document.getElementById("return-to-posts").addEventListener('click', () => {
                showSection(postPageSection, `/posts`);
                loadPosts(); //  Ensure posts are loaded
            });}

            document.getElementById('commentForm').addEventListener('submit', function (event) {
                event.preventDefault();  //  Prevent default form submission
    
                const commentText = document.getElementById("commentText").value.trim();
                const postID = document.getElementById("postID").value;
    
                if (!commentText) {
                    console.log(" Comment cannot be empty.");
                    return;
                }
    
                const requestBody = JSON.stringify({ post_id: parseInt(postID), content: commentText });
    
                console.log(" Sending JSON Data:", requestBody);
    
                fetch("/create-comment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: requestBody
                })
                .then(response => response.json())
                .then(data => {
                    console.log(" Server Response:", data);
    
                    if (data.success) {
                        //  Clear input field
                        document.getElementById("commentText").value = "";
    
                        //  Reload comments without redirecting
                        loadCommentsForPost(postID);
                    } else {
                        console.log(" Error: " + data.message);
                    }
                })
                .catch(error => errorPage(500));
            });
            
        })
        .catch(error => {
            console.error(" Error loading comments:", error);
            commentsSection.innerHTML = "<p>Failed to load comments.</p>";
            errorPage(500)
        });
    }   

});

function likeDislikeComment(commentId, isLike) {
    if (isErrorState) {
        console.warn("Cannot send data; application is in an error state.");
        return; // Exit if in error state
    }
    console.log(` Sending Like/Dislike request for Comment ID: ${commentId}, Is Like: ${isLike}`);

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
    .catch(error => errorPage(500));
}

function likeDislikePost(postId, isLike) {
    if (isErrorState) {
        console.warn("Cannot send data; application is in an error state.");
        return; // Exit if in error state
    }
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
        errorPage(500)
    });
}

function getInteractions(postId, commentId = null) {
    if (isErrorState) {
        console.warn("Cannot send data; application is in an error state.");
        return; // Exit if in error state
    }
    let requestBody = commentId 
        ? { comment_id: commentId } // Fetch comment interactions
        : { post_id: postId };      // Fetch post interactions

    fetch('/getInteractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log(" Updated Interaction Data:", data);

        if (!data || typeof data.likes === "undefined" || typeof data.dislikes === "undefined") {
            console.error(" Invalid data received:", data);
            return;
        }

        if (commentId) {
            //  Update comment likes/dislikes
            let likesElement = document.getElementById(`likesCountComment${commentId}`);
            let dislikesElement = document.getElementById(`dislikesCountComment${commentId}`);

            if (likesElement) likesElement.innerText = `Likes: ${data.likes}`;
            if (dislikesElement) dislikesElement.innerText = `Dislikes: ${data.dislikes}`;
        } else {
            //  Update post likes/dislikes
            let likesElement = document.getElementById(`likesCountPost${postId}`);
            let dislikesElement = document.getElementById(`dislikesCountPost${postId}`);

            if (likesElement) likesElement.innerText = `Likes: ${data.likes}`;
            if (dislikesElement) dislikesElement.innerText = `Dislikes: ${data.dislikes}`;
        }
    })
    .catch(error => errorPage(500));
}

function checkSession() {
    if (isErrorState) {
        console.warn("Cannot send data; application is in an error state.");
        return; // Exit if in error state
    }
    fetch('/check-session', {
        method: 'GET',
        credentials: 'include' 
    })
        .then(response => response.json())
        .then(data => {
            userID = data.userID;
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const logoutButton = document.getElementById('logoutButton');
            const postsButton = document.getElementById('postsButton');

            if (data.loggedIn && typeof data.userID !== "undefined") {
                console.log(" User is logged in:", data.userID);
                loadAndInitChat(data.userID);
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
        .catch(error => errorPage(500));
}

function toggleDropdown(id) {
    var dropdown = document.getElementById(id);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; // Toggle visibility
}

