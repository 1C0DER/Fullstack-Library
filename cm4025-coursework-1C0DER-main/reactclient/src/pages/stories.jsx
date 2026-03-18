// src/pages/Stories.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookIcon from '../Images/book-icon.png';
import profileIcon from '../Images/icon.png';
import { fetchFilteredStories} from '../JS/storydetail';
import '../main.css';

// eslint-disable-next-line no-unused-vars
import { submitStoryRating } from '../JS/storydetail';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [genre, setGenre] = useState('');
  const [excludeRead, setExcludeRead] = useState(false);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    if (genre === '') return;

    const token = getToken();

    fetchFilteredStories(genre, excludeRead, token)
      .then(setStories)
      .catch((err) => {
        console.error('Error fetching stories:', err);
        alert('Error fetching stories');
      });
  }, [genre, excludeRead]);

  const handleGenreChange = (e) => {
    const selectedGenre = e.target.value;
    if (selectedGenre === '') {
      window.location.reload(); // Reset page if "All Genres"
    } else {
      setGenre(selectedGenre);
    }
  };

  const handleApplyFilters = () => {
    setGenre(genre); // optional trigger
  };

  return (
    <div>
      <header>
        <h1>
          <Link to="/stories">
            <img className="book" src={bookIcon} alt="book" />
            Microfiction Library
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
        <h2 className="page-title">Microfiction Stories</h2>

        <div className="top-items">
          <section className="filter-search">
            <select id="genre-filter" value={genre} onChange={handleGenreChange}>
              <option value="">All Genres</option>
              {[
                'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery',
                'Thriller', 'Horror', 'Romance', 'Adventure', 'Drama', 'Comedy',
                'Historical', 'Poetry', 'Action', 'Crime', 'Supernatural',
                'Dystopian', 'Mythology', 'Satire', 'Philosophical', 'Fable'
              ].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <label htmlFor="exclude-read">
              <input
                type="checkbox"
                id="exclude-read"
                checked={excludeRead}
                onChange={(e) => setExcludeRead(e.target.checked)}
              />
              Exclude stories I've read
            </label>

            <button id="apply-filters" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </section>
        </div>

        <div id="story-list">
          {stories.length === 0 ? (
            <p>No stories found.</p>
          ) : (
            stories.map((story) => (
              <div key={story._id} className="story-item">
                <h3>{story.title}</h3>
                <p>Genre: {story.genre} | Rating: {story.rating.toFixed(1)} | Votes: {story.ratingCount}</p>
                <p>Status: {story.visibility}</p>
                <p>Username: {story.username}</p>
                <p>Content: {story.content}</p>
              </div>
            ))
          )}
        </div>
      </main>

      <footer>
        <p>&copy; 2025 Microfiction Library</p>
      </footer>
    </div>
  );
};

export default Stories;
