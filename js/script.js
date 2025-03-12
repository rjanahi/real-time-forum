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

    // Event listeners for buttons
    signUpButton.addEventListener('click', () => {
        showSection(signUpSection, '/signup');
    });

    logInButton.addEventListener('click', () => {
        showSection(logInSection, '/login');
    });

    postsButton.addEventListener('click', () => {
        showSection(postPageSection, '/posts');
    });

    createPostButton.addEventListener('click', () => {
        showSection(createPostSection, '/create-post');
    });

    aboutUsButton.addEventListener('click', () => {
        showSection(aboutUsSection, '/about-us');
    });

    // Initialize by showing the main section
    showSection(mainSection, '/');

    // Registration form submission
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = {
            username: document.getElementById('username').value,
            fname: document.getElementById('fname').value,
            lname: document.getElementById('lname').value,
            email: document.getElementById('email').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            password: document.getElementById('password').value,
        };

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            // Log response status and text to debug
            console.log("Response status:", response.status);
            return response.text().then(text => {
                console.log("Response text:", text); // Log raw response
                return text ? JSON.parse(text) : {}; // Parse JSON or return empty object
            });
        })
        .then(data => {
            const feedbackMessage = document.getElementById('feedbackMessage');
            if (data.success) {
                feedbackMessage.textContent = 'Registration successful!';
                feedbackMessage.style.color = 'green';
                document.getElementById('registrationForm').reset();
                showSection(logInSection, '/login'); // Navigate to login section
            } else {
                feedbackMessage.textContent = data.message || 'Registration failed.';
                feedbackMessage.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('feedbackMessage').textContent = 'An error occurred. Please try again.';
        });
    });
});