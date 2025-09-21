//load all the posts
function loadPosts() {
    fetch('/get-posts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
        .then(response => {

            if (!response.ok) {
                errorPage(response.status, response.statusText);
                throw response;
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

                const safeTitle = escapeHTML(post.title);
                const safeContent = escapeHTML(post.content);
                const safeUsername = escapeHTML(post.username);
                const safeCreatedAt = escapeHTML(post.createdAt);
                const safeCategories = Array.isArray(post.categories)
                    ? post.categories.map(escapeHTML).join(", ")
                    : "";

                postElement.innerHTML = `
            <div class="comment-post">
                <h2>${safeTitle}</h2>
                <p>${safeContent}</p>
                <small>Posted by <strong>${safeUsername}</strong> on ${safeCreatedAt}</small><br>
                <small>Category: ${safeCategories}</small>
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
                button.addEventListener('click', () => {
                    showSection(commentsSection, `/comment/${button.dataset.postId}`, { route: "comment", postId: button.dataset.postId }, { updateHistory: true });
                    loadCommentsForPost(button.dataset.postId)
                });
            });

        })
        .catch(error => errorPage(error.status, error.statusText));
}

//load only user posts
function loadMyPosts() {

    fetch('/get-myPosts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                errorPage(response.status, response.statusText);
                throw response;
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

                const safeTitle = escapeHTML(post.title);
                const safeContent = escapeHTML(post.content);
                const safeUsername = escapeHTML(post.username);
                const safeCreatedAt = escapeHTML(post.createdAt);
                const safeCategories = Array.isArray(post.categories)
                    ? post.categories.map(escapeHTML).join(", ")
                    : "";

                postElement.innerHTML = `
                    <div class="comment-post">
                        <h2>${safeTitle}</h2>
                        <p>${safeContent}</p>
                        <small>Posted by <strong>${safeUsername}</strong> on ${safeCreatedAt}</small><br>
                        <small>Category: ${safeCategories}</small>
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
        .catch(err => errorPage(err.status, err.statusText));
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
                errorPage(response.status, response.statusText);
                throw response;
            }
            return response.json();
        })
        .then(posts => {
            const postContainer = document.querySelector('.container-post');

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

                const safeTitle = escapeHTML(post.title);
                const safeContent = escapeHTML(post.content);
                const safeUsername = escapeHTML(post.username);
                const safeCreatedAt = escapeHTML(post.createdAt);
                const safeCategories = Array.isArray(post.categories)
                    ? post.categories.map(escapeHTML).join(", ")
                    : "";

                postElement.innerHTML = `
            <div class="comment-post">
                <h2>${safeTitle}</h2>
                <p>${safeContent}</p>
                <small>Posted by <strong>${safeUsername}</strong> on ${safeCreatedAt}</small><br>
                <small>Category: ${safeCategories}</small>
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
        .catch(err => errorPage(err.status, err.statusText));
}

window.loadPosts = loadPosts;
window.loadMyPosts = loadMyPosts;
window.loadCategoryPosts = loadCategoryPosts;
