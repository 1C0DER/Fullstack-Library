import React, { useEffect, useState } from 'react';
import '../main.css'; // Adjust the path if needed
import bookIcon from '../Images/book-icon.png';
import { Link } from 'react-router-dom';
import profileIcon from '../Images/icon.png';

const AuthorRankings = () => {
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/topAuthors')
            .then(response => response.json())
            .then(data => setAuthors(data))
            .catch(err => {
                console.error('Error fetching authors:', err);
                setError('Error fetching authors');
            });
    }, []);

    return (
        <div>
            <header>
                    <h1>
                      <Link to="/stories">
                        <img className="book" src={bookIcon} alt="book" />
                        Author Ranking
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
                        <img src={profileIcon} alt="Profile" className="profile-icon" id="profile-icon" />
                        <div className="dropdown-content" id="dropdown-menu">
                          <Link to="/profile">Profile</Link>
                          <Link to="/login">Login</Link>
                          <Link to="/signup">Sign Up</Link>
                        </div>
                      </div>
                    </div>
                  </header>

            <main>
                <section className="ranking">
                    <h2>Top Authors</h2>
                    <div className="ranking-list" id="author-ranking-list">
                        {error ? (
                            <p>{error}</p>
                        ) : authors.length === 0 ? (
                            <p>No authors found.</p>
                        ) : (
                            authors.map((author, index) => (
                                <div key={index} className="author-item">
                                    <h3>{author.authorName}</h3>
                                    <p>Total Rating: {author.totalRating} | Stories: {author.storyCount}</p>
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

export default AuthorRankings;
