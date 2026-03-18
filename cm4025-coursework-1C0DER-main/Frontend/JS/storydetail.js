// Event listener for the story submission form
document.getElementById('submit-form').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent form submission

     // Get necessary data from the form
    const token = localStorage.getItem('token');  // Get the token from localStorage
    const guestName = document.getElementById('guest-name').value;  // Get the guest name
    const title = document.getElementById('quoteName').value; //Getting the story name
    const content = document.getElementById('story-content').value; //Getting the story content
    const genre = document.getElementById('genre').value; //Getting the genre of the story
    const visibility = document.querySelector('input[name="visibility"]:checked').value; //Getting the visibility option (public/private)

    // Create the request body
    const storyData = {
        title,
        content,
        genre,
        visibility,
        guestName: guestName || null,  // If a guest name is provided, include it; otherwise, null
    };

    const headers = {
        'Content-Type': 'application/json',
    };

    // If the user is logged in, include the token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Send the request to create the story
    fetch('/api/storeStory', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(storyData),
    })
        .then(response => response.json()) //Handling the response
        .then(data => {
            alert(data.message); // Response meesage for the user
            window.location.href = '/HTML/stories.html';  // Redirect after submission
        })
        .catch(error => {
            console.error('Error submitting story:', error); // Check for any errors
            alert('Error submitting story'); // Alert the user in case of an error
        });
});


// Event listener to the SignUp form for validation
function submitSignUp() {
    const email = document.getElementById('email').value; // Get the email 
    const username = document.getElementById('username').value; // Get the username
    const password = document.getElementById('password').value; // Get the password
    const role = document.querySelector('input[name="role"]:checked').value;

    // Validate email format using regex
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return; // Stop execution if email is invalid
    }

    // Validate password strength
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
        document.getElementById('passwordHelp').style.display = 'block';
        return; // Stop it if password is weak
    } else {
        document.getElementById('passwordHelp').style.display = 'none';
    }

    // Prepare the user data to be sent to the backend
    const userData = {
        email,
        username,
        password,
        role
    };

    // Send the data to the server for user registration
    fetch('/api/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData) // Convert the user data to JSON format
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        alert(data.message);
        window.location.href = '/HTML/Login.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error Signing Up');
    });
}

// The event listener to the form to call the submitSignUp function
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent default form submission
    submitSignUp();  // Call the submitSignUp function to handle the POST request
});

// Function to submit login form and store token
function submitLogin() {
    const username = document.getElementById('username').value; // Get the username
    const password = document.getElementById('password').value; // Get the password

    const loginData = { username, password };

    //Send the login data to the server for authentication
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData) // Convert the login data to JSON format
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);  // Save token in localStorage
            window.location.href = '/HTML/Profile.html';  // Redirect to the profile page
        } else {
            document.getElementById('error-message').style.display = 'block';  // Show error message
        }
    })
    .catch(error => {
        console.error('Error during login:', error); // Check for any errors
        alert('An error occurred during login.'); // Alert the user in case of an error
    });
}

// Checking if the user is logged in and the token is present when the page loads
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');  // Get the token from localStorage

    if (!token) {
        // If no token is found, redirect to login page
        window.location.href = '/HTML/Login.html';
    } else {
        // Decode JWT token (this will work without any library)
        const userData = JSON.parse(atob(token.split('.')[1]));  // Decode the payload of the JWT token

        // Check if userData and username exist
        if (userData && userData.username) {
            // Update the <span id="user-name"> element with the username
            document.getElementById('user-name').textContent = userData.username;
        } else {
            console.error('Username not found in token');
        }
    }
});

// Function to update the user status (author, reader, both)
function updateStatus() {
    const authorRadio = document.getElementById('author-radio');
    const readerRadio = document.getElementById('reader-radio');
    const bothRadio = document.getElementById('both-radio');

    let status = '';  // Declare the status variable here

    // Ensure at least one radio button is selected
    if (authorRadio.checked) {
        status = 'author';
    } else if (readerRadio.checked) {
        status = 'reader';
    } else if (bothRadio.checked) {
        status = 'both';
    } else {
        alert('Please select a status.');
        return;  // Exit if no status is selected
    }

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please log in to update your status');
        return;
    }

    const userData = JSON.parse(atob(token.split('.')[1]));  // Decode token to get user data
    const userId = userData.userId;  // User's ID from the token

    // Prepare the new status data to be sent to the backend
    const statusData = {
        userId,
        status
    };

    // Send the status update to the server
    fetch('/api/updateStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusData)  // Send the status update
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Status updated successfully!');
            document.getElementById('status').textContent = status;  // Update status on profile page
        } else {
            alert('Error updating status');
        }
    })
    .catch(error => {
        console.error('Error:', error); // Check for any errors
        alert('Error updating status'); // Alert the user in case of an error
    });
}

// Event listener for the logout button
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');  // Get the token from localStorage

    if (!token) {
        // If no token, redirect to login
        window.location.href = '/HTML/Login.html';
    } else {
        // Fetch the user's stories from the backend
        fetch('/api/userStories', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the request headers for authentification
            }
        })
        .then(response => response.json())
        .then(stories => {
            const storyList = document.getElementById('user-story-list'); // Get the story list element where stories will be displayed
            
            // Check if there are any stories to display
            if (stories.length === 0) {
                storyList.innerHTML = '<li>No stories found.</li>'; // If no stories, show a message
            } else {
                // A loop to create a list item for each story
                stories.forEach(story => {
                    const storyItem = document.createElement('li');
                    storyItem.innerHTML = `
                        <h3>${story.title}</h3>
                        <p>Genre: ${story.genre} | Rating: ${story.rating}</p>
                        <button onclick="editStory('${story._id}')">Edit</button>
                        <button onclick="deleteStory('${story._id}')">Delete</button>
                    `;
                    storyList.appendChild(storyItem);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching stories:', error);
            alert('Error fetching stories');
        });
    }
});

// An event listener to check token and fetch user stories when the page loads
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');  // Get the token from localStorage

    if (!token) {
        // If no token, redirect to login
        window.location.href = '/HTML/Login.html';
    } else {
        // Fetch the user's stories from the backend
        fetch('/api/userStories', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(stories => {
            const storyList = document.getElementById('user-story-list');
            if (stories.length === 0) {
                storyList.innerHTML = '<li>No stories found.</li>';
            } else {
                stories.forEach(story => {
                    const storyItem = document.createElement('li');
                    storyItem.innerHTML = `
                        <h3>${story.title}</h3>
                        <p>Genre: ${story.genre} | Rating: ${story.rating}</p>
                        <button onclick="editStory('${story._id}')">Edit</button> 
                        <button onclick="deleteStory('${story._id}')">Delete</button>
                    `;
                    storyList.appendChild(storyItem);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching stories:', error);
            alert('Error fetching stories');
        });
    }
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function () {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    
    // Redirect the user to the login page
    window.location.href = '/HTML/Login.html';
});