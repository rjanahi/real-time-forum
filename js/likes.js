function likeDislikeComment(commentId, isLike) {

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
            return response.json()
        })
        .then(data => {
            console.log(" Like/Dislike Comment Response:", data);

            if (data.message === 'Interaction updated successfully') {
                likesElement.innerText = `Likes: ${data.likes}`;
                dislikesElement.innerText = `Dislikes: ${data.dislikes}`;
            } else {
                console.log(data.error || "Something went wrong.");
            }
            socket.send(JSON.stringify({ type: "new_commentLike", comment_id: parseInt(commentId), is_like: isLike }));
        })
        .catch(error => errorPage(500));
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
            socket.send(JSON.stringify({ type: "new_postLike", post_id: parseInt(postId), is_like: isLike }));
        })
        .catch(error => {
            console.error(' Error:', error);
            errorPage(500)
        });
}

function getInteractions(postId, commentId = null) {

    let requestBody = commentId ? { comment_id: commentId } : { post_id: postId };

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

window.getInteractions = getInteractions;
window.likeDislikeComment = likeDislikeComment;
window.likeDislikePost = likeDislikePost;