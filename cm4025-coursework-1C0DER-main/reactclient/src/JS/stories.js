// src/utils/storyHelpers.js

// Fetch filtered stories with optional genre and excludeRead params
export const fetchFilteredStories = async (genre, excludeRead, token) => {
    const query = new URLSearchParams({
      genre,
      excludeRead,
    }).toString();
  
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
  
    const response = await fetch(`/api/filterStories?${query}`, {
      method: 'GET',
      headers,
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch filtered stories');
    }
  
    return await response.json();
  };
  
  // Submit a rating for a story
  export const submitStoryRating = async (storyId, ratingValue) => {
    const token = localStorage.getItem('token');
  
    const response = await fetch('/api/rateStory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ storyId, rating: ratingValue }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to submit rating');
    }
  
    return await response.json();
  };
  