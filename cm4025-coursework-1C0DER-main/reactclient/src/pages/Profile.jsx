// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bookIcon from '../Images/book-icon.png';
import profileIcon from '../Images/icon.png';
import '../main.css';

const Profile = () => {
  const [username, setUsername] = useState('Loading...');
  const [status, setStatus] = useState('Loading...');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // Moved here to prevent useEffect dependency warning
    const decodeUserFromToken = () => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    };

    const userData = decodeUserFromToken();
    if (userData && userData.username) {
      setUsername(userData.username);
    }

    fetch('/api/userStories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setStories(data);
      })
      .catch(err => {
        console.error('Error fetching stories:', err);
        alert('Error fetching stories');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const updateStatus = () => {
    if (!selectedStatus) return alert('Please select a status.');

    const token = getToken();
    const userData = (() => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    })();

    if (!token || !userData) return alert('Please log in to update your status.');

    fetch('/api/updateStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: userData.userId, status: selectedStatus }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Status updated successfully!');
          setStatus(selectedStatus);
        } else {
          alert('Error updating status');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Error updating status');
      });
  };

  const deleteStory = (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    const token = getToken();
    fetch('/api/deleteStory', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ storyId }),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setStories(stories.filter(story => story._id !== storyId));
      })
      .catch(err => {
        console.error('Error deleting story:', err);
        alert('Error deleting story');
      });
  };

  return (
    <div>
      <header>
        <h1>
          <Link to="/stories">
            <img className="book" src={bookIcon} alt="book" />
            Profile
          </Link>
        </h1>

        <div className="right-side">
          <nav>
            <ul>
              <li><Link to="/authorrank">Author Ranking</Link></li>
              <li><Link to="/storyrank">Story Ranking</Link></li>
              <li><Link to="/submitstory">Submit a Story</Link></li>
            </ul>
          </nav>

          <div className="profile">
            <img src={profileIcon} alt="Profile" className="profile-icon" />
            <div className="dropdown-content">
              <Link to="/profile">Profile</Link>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="user-info">
          <h2>Welcome, <span>{username}</span></h2>
        </section>

        <section className="user-status">
          <h2>Your Status</h2>
          <p><strong>Status: </strong><span>{status}</span></p>
          <div>
            <label><input type="radio" name="status" value="author" onChange={handleStatusChange} /> Author</label><br />
            <label><input type="radio" name="status" value="reader" onChange={handleStatusChange} /> Reader</label><br />
            <label><input type="radio" name="status" value="both" onChange={handleStatusChange} /> Author & Reader</label><br />
          </div>
          <button onClick={updateStatus}>Update Status</button>
        </section>

        <section className="user-stories">
          <h2>Your Submitted Stories</h2>
          <ul>
            {stories.length === 0 ? (
              <li>No stories found.</li>
            ) : (
              stories.map((story) => (
                <li key={story._id}>
                  <h3>{story.title}</h3>
                  <p><strong>Genre:</strong> {story.genre}</p>
                  <p><strong>Status:</strong> {story.visibility}</p>
                  <p><strong>Username:</strong> {story.username}</p>
                  <p><strong>Content:</strong> {story.content}</p>
                  <p><strong>Rating:</strong> {story.rating} | <strong>Votes:</strong> {story.ratingCount}</p>
                  <button onClick={() => deleteStory(story._id)}>Delete</button>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="auth-buttons">
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 Microfiction Library</p>
      </footer>
    </div>
  );
};

export default Profile;
