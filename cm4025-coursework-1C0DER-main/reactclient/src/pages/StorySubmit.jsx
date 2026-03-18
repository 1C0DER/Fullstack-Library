// src/pages/StorySubmit.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bookIcon from '../Images/book-icon.png';
import profileIcon from '../Images/icon.png';
import '../main.css';

const StorySubmit = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('Fiction');
  const [visibility, setVisibility] = useState('public');
  const [guestName, setGuestName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const storyData = {
      title,
      content,
      genre,
      visibility,
      guestName: guestName || null,
    };

    try {
      const res = await fetch('/api/storeStory', {
        method: 'POST',
        headers,
        body: JSON.stringify(storyData),
      });
      const data = await res.json();
      alert(data.message);
      navigate('/stories'); // Redirect to stories page
    } catch (err) {
      console.error('Error submitting story:', err);
      alert('Error submitting story');
    }
  };

  return (
    <div>
      <header>
        <h1>
          <Link to="/stories">
            <img className="book" src={bookIcon} alt="book" />
            Submit your Microfiction story
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
        <form onSubmit={handleSubmit}>
          <label htmlFor="quoteName">Enter Story Title:</label>
          <input
            type="text"
            id="quoteName"
            placeholder="Enter your story title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="story-content">Content:</label>
          <textarea
            id="story-content"
            rows="5"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <label htmlFor="genre">Genre:</label>
          <select
            id="genre"
            required
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            {[
              'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery',
              'Thriller', 'Horror', 'Romance', 'Adventure', 'Drama', 'Comedy',
              'Historical', 'Poetry', 'Action', 'Crime', 'Supernatural',
              'Dystopian', 'Mythology', 'Satire', 'Philosophical',
              'Psychological', 'Fable'
            ].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label>Visibility:</label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
            />
            Private
          </label>

          <label htmlFor="guest-name">Guest Name (Optional):</label>
          <input
            type="text"
            id="guest-name"
            placeholder="Enter your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />

          <button type="submit">Submit Story</button>
        </form>
      </main>

      <footer>
        <p>&copy; 2025 Microfiction Library</p>
      </footer>
    </div>
  );
};

export default StorySubmit;
