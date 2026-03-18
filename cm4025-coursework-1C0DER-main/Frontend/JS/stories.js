// Event listener to run when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/getStories')
        .then(response => response.json())
        .then(stories => {
            console.log(stories);  // Ensure this logs the data properly
            const storyList = document.getElementById('story-list');  // Ensure the element exists

            // Check if the story list element exists
            if (!storyList) {
                console.error('Story list element not found!');
                return;
            }

            // Clear existing stories in case there's a previous load
            storyList.innerHTML = '';

            // Iterate over the stories and add them to the page
            stories.forEach(story => {
                const storyDiv = document.createElement('div');
                storyDiv.classList.add('story');
            
                // Html content for each story
                storyDiv.innerHTML = `
                    <h3>${story.title}</h3>
                    <p><strong>Genre:</strong> ${story.genre}</p>
                    <p><strong>Status:</strong> ${story.visibility}</p>
                    <p><strong>Username:</strong> ${story.username}</p>
                    <p><strong>Content:</strong> ${story.content}</p>
                    <p><strong>Rating:</strong> ${story.rating} | <strong>Votes:</strong> ${story.ratingCount}</p>
                    
                    <!-- Star rating for submitting votes -->
                    <div class="star-rating">
                        <label for="star-1-${story._id}">1</label>
                        <input type="radio" id="star-1-${story._id}" name="rating-${story._id}" value="1">
                        <label for="star-2-${story._id}">2</label>
                        <input type="radio" id="star-2-${story._id}" name="rating-${story._id}" value="2">
                        <label for="star-3-${story._id}">3</label>
                        <input type="radio" id="star-3-${story._id}" name="rating-${story._id}" value="3">
                        <label for="star-4-${story._id}">4</label>
                        <input type="radio" id="star-4-${story._id}" name="rating-${story._id}" value="4">
                        <label for="star-5-${story._id}">5</label>
                        <input type="radio" id="star-5-${story._id}" name="rating-${story._id}" value="5">
                    </div>
                    <button onclick="submitRating('${story._id}')">Submit Rating</button>
                `;
            
                // Append the newly created div to the story list
                storyList.appendChild(storyDiv);
            });            
        })
        .catch(error => {
            console.error('Error fetching stories:', error);
        });
});

// Handle rating submission
function submitRating(storyId) {
    const rating = document.querySelector(`input[name="rating-${storyId}"]:checked`);

    if (rating) {
        const ratingValue = rating.value;

        // Send the rating to the backend
        fetch('/api/rateStory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ storyId, rating: ratingValue })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            updateStoryRatingUI(storyId, data.rating, data.ratingCount);  // Update UI with new rating and count
        })
        .catch(error => {
            console.error('Error submitting rating:', error);
        });
    } else {
        alert('Please select a rating!');
    }
}

// Update the rating and count in the UI
function updateStoryRatingUI(storyId, newRating, newCount) {
    const ratingElement = document.querySelector(`#story-${storyId} .rating`);
    const ratingCountElement = document.querySelector(`#story-${storyId} .rating-count`);

    if (ratingElement) {
        ratingElement.textContent = `Rating: ${newRating}`;  // Show total rating sum
    }
    if (ratingCountElement) {
        ratingCountElement.textContent = `(${newCount} votes)`;  // Show rating count
    }
}