// src/JS/storydetail.js (React-friendly version)

// ----------------------
// Submit Story Function
// ----------------------
export const handleStorySubmit = async ({ title, content, genre, visibility, guestName }) => {
    try {
      const token = localStorage.getItem('token');
  
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
  
      const storyData = {
        title,
        content,
        genre,
        visibility,
        guestName: guestName || null
      };
  
      const response = await fetch('/api/storeStory', {
        method: 'POST',
        headers,
        body: JSON.stringify(storyData)
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting story:', error);
      throw error;
    }
  };
  
  // -------------------
  // Sign Up Validation
  // -------------------
  export const handleSignUp = async ({ email, username, password, role }) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) throw new Error('Invalid email format');
  
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) throw new Error('Weak password');
  
    const response = await fetch('/api/signUp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, role })
    });
  
    const data = await response.json();
    return data;
  };
  
  // ------------------
  // Get User Stories
  // ------------------
  export const getUserStories = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/userStories', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    const data = await response.json();
    return data;
  };
  
  // ------------------
  // Delete a Story
  // ------------------
  export const deleteUserStory = async (storyId) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/deleteStory', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ storyId })
    });
  
    const data = await response.json();
    return data;
  };
  
  // ------------------
  // Update User Status
  // ------------------
  export const updateUserStatus = async (status) => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(atob(token.split('.')[1]));
  
    const response = await fetch('/api/updateStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: userData.userId, status })
    });
  
    const data = await response.json();
    return data;
  };
  
  // ------------------
  // Logout Function
  // ------------------
  export const logoutUser = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  
  // ------------------
  // Decode JWT Token
  // ------------------
  export const getDecodedUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  };
  
  // ------------------------------
// Fetch Filtered Stories
// ------------------------------
export const fetchFilteredStories = async ({ genre, excludeRead }) => {
    const token = localStorage.getItem('token');
    const headers = {};
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const query = new URLSearchParams({
      genre,
      excludeRead,
    }).toString();
  
    const response = await fetch(`/api/filterStories?${query}`, {
      method: 'GET',
      headers,
    });
  
    const data = await response.json();
    return data;
  };
  