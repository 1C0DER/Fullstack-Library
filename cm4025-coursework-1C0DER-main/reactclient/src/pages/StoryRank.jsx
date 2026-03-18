// src/pages/StoryRank.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookIcon from '../Images/book-icon.png';
import profileIcon from '../Images/icon.png';
import '../main.css';

const StoryRank = () => {
  const [topStories, setTopStories] = useState([]);

  useEffect(() => {
    fetch('/api/topRatedStories')
      .then(res => res.json())
      .then(data => {
        setTopStories(data);
      })
      .catch(err => {
        console.error('Error fetching top-rated stories:', err);
        alert('Error loading top-rated stories');
      });
  }, []);

  return (
    <div>
      <header>
        <h1>
          <Link to="/stories">
            <img className="book" src={bookIcon} alt="book" />
            Story Ranking
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
        <section className="ranking">
          <h2>Top Rated Stories</h2>
          <div className="ranking-list" id="ranking-list">
            {topStories.length === 0 ? (
              <p>No stories available</p>
            ) : (
              topStories.map((story) => (
                <div className="story-item" key={story._id}>
                  <h3>{story.title}</h3>
                  <p>Genre: {story.genre}</p>
                  <p>
                    Average Rating: {story.rating.toFixed(1)} | {story.ratingCount} Ratings
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 Microfiction Library</p>
      </footer>
    </div>
  );
};

export default StoryRank;
