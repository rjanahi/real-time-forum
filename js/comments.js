let thisPostId = null;



function loadCommentsForPost(postId) {
   
    fetch(`/comments?post_id=${postId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
        .then(response => {
            switch (response.status) {
                case 401:
                    errorPage(401); // Handle unauthorized access
                    return;
                case 403:
                    errorPage(403); // Handle forbidden access
                    return;
                case 404:
                    errorPage(404);
                    return;
                case 405:
                    errorPage(405);
                    return;
                case 500:
                    errorPage(500);
                    return;
                default:
                    break;
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(parsedResponse => {
            console.log(" Server Response:", parsedResponse);

            if (parsedResponse.error) {
                console.error(" Server Error:", parsedResponse.error);
                commentsSection.innerHTML = `<p>Error loading comments: ${escapeHTML(parsedResponse.error)}</p>`;
                return;
            }

            const post = parsedResponse.post;
            const comments = parsedResponse.comments;

            commentsSection.innerHTML = `
        <button id="return-to-posts" class="return-button">Return</button>
        <div class="comment-post">
            <h2>${escapeHTML(post.title)}</h2>
            <p>${escapeHTML(post.content)}</p>
            <small>
              Posted by <strong>${escapeHTML(post.username)}</strong>
              on ${escapeHTML(post.createdAt)}
              - ${Array.isArray(post.categories) ? post.categories.map(escapeHTML).join(', ') : ''}
            </small>
        </div>
        <div class="container-about">
            <h2>Comments</h2>
            <div id="commentsList"></div><br><br>
            <form id="commentForm">
                <textarea id="commentText" name="comment" placeholder="Write your comment here..." maxlength="120" required></textarea><br>
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
                    <p>
                      <strong>${escapeHTML(comment.username)}:</strong> ${escapeHTML(comment.content)}
                      <small>${escapeHTML(formattedDate)}</small>
                    </p>
                    <span class="material-icons" id="likeComment${comment.id}" onclick="likeDislikeComment(${comment.id}, true)"> thumb_up </span>
                    <span id="likesCountComment${comment.id}">0</span>
                    <span class="material-icons" id="dislikeComment${comment.id}" onclick="likeDislikeComment(${comment.id}, false)"> thumb_down </span>
                    <span id="dislikesCountComment${comment.id}">0</span>
                </div>
            `;

                    // Fetch and update likes/dislikes for each comment
                    getInteractions(null, comment.id);
                });
            }

            showSection(commentsSection, `/comment/${postId}`);

            const returnBtn = document.getElementById("return-to-posts");
            if (returnBtn) {
                returnBtn.addEventListener('click', () => {
                    showSection(postPageSection, `/posts`);
                    loadPosts();
                });
            }

            document.getElementById('commentForm').addEventListener('submit', function (event) {
                event.preventDefault();  // Prevent default form submission

                let commentText = document.getElementById("commentText").value.trim();
                const postID = document.getElementById("postID").value;

                // Enforce 120-char max (belt-and-suspenders)
                if (commentText.length > 120) {
                    commentText = commentText.slice(0, 120);
                    document.getElementById("commentText").value = commentText;
                }

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
                            document.getElementById("commentText").value = "";
                            loadCommentsForPost(postID);
                        } else {
                            console.log(" Error: " + data.message);
                        }
                        console.log(" Comment ID:", data.comment_id);
                        socket.send(JSON.stringify({ type: "new_comment" , post_id: parseInt(postID) , comment_id: data.comment_id}));
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

window.loadCommentsForPost = loadCommentsForPost;
window.thisPostId = thisPostId;
