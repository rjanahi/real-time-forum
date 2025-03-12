document.addEventListener('DOMContentLoaded', () => {
    // Get references to the sections
    const mainSection = document.getElementById('mainPage');
    const signUpSection = document.getElementById('signUpSection');
    const logInSection = document.getElementById('logInSection');
    const postPageSection = document.getElementById('postPageSection');
    const createPostSection = document.getElementById('createPostSection');
    const aboutUsSection = document.getElementById('aboutUsSection');

    // Get references to the buttons
    const signUpButton = document.getElementById('signUpButton');
    const postsButton = document.getElementById('postsButton');
    const createPostButton = document.getElementById('createPostButton');
    const aboutUsButton = document.getElementById('aboutUsButton');
    const logInButton = document.getElementById('logInButton');

    // Function to show a section and hide others
    function showSection(sectionToShow) {
        mainSection.hidden = true;
        signUpSection.hidden = true;
        logInSection.hidden = true;
        postPageSection.hidden = true;
        createPostSection.hidden = true;
        aboutUsSection.hidden = true;
        sectionToShow.hidden = false;
    }

    // Event listeners for buttons
    signUpButton.addEventListener('click', () => {
        showSection(signUpSection);
    });

    logInButton.addEventListener('click', () => {
        showSection(logInSection);
    });

    postsButton.addEventListener('click', () => {
        showSection(postPageSection);
    });

    createPostButton.addEventListener('click', () => {
        showSection(createPostSection);
    });

    aboutUsButton.addEventListener('click', () => {
        showSection(aboutUsSection);
    });

    

    // Initialize by showing the main section
    showSection(mainSection);
});

// Fetch likes and dislikes count for each post
function getInteractions(id, type) {
    let body = {};
    let likesElementId, dislikesElementId;

    if (type === 'post') {
        body.post_id = id;
        likesElementId = `likesCountPost${id}`;
        dislikesElementId = `dislikesCountPost${id}`;
    } else if (type === 'comment') {
        body.comment_id = id;
        likesElementId = `likesCountComment${id}`;
        dislikesElementId = `dislikesCountComment${id}`;
    } else {
        console.error('Invalid type specified for getInteractions');
        return;
    }

    fetch('/getInteractions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    .then(response => response.json())
    .then(data => {
        if (type === 'post') {
            // For posts, display with "Likes: X"
            document.getElementById(likesElementId).innerText = `Likes: ${data.likes}`;
            document.getElementById(dislikesElementId).innerText = `Dislikes: ${data.dislikes}`;
        } else if (type === 'comment') {
            // For comments, display only the number
            document.getElementById(likesElementId).innerText = data.likes;
            document.getElementById(dislikesElementId).innerText = data.dislikes;
        }
    })
    .catch(error => console.error('Error fetching likes/dislikes:', error));
}





function toggleDropdown(id) {
    var dropdown = document.getElementById(id);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; // Toggle visibility
}

function likeDislikePost(postId, isLike) {
    fetch('/likeDislikePost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_id: postId,
            is_like: isLike
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Post interaction updated successfully');
            location.reload(); // Refresh the page
        } else {
            location.reload(); // Refresh the page if desired
        }
    })
    .catch(error => {
        console.error('Error:', error);
        location.reload(); // Refresh the page if desired
    });
}

function likeDislikeComment(postId, commentId, isLike) {
    fetch('/likeDislikeComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_id: postId,
            comment_id: commentId,
            is_like: isLike,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Comment interaction updated successfully');
            location.reload(); // Refresh the page if desired
        } else {
            location.reload(); // Refresh the page if desired
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating comment interaction.'); // Error handling
    });
}