// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bookIcon from '../Images/book-icon.png';
import profileIcon from '../Images/icon.png';
import '../main.css';

const SignUp = () => {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Password pattern validation
  const isPasswordStrong = (pwd) => {
    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return pattern.test(pwd);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Show password help if weak
    if (!isPasswordStrong(password)) {
      setPasswordError(true);
      return;
    } else {
      setPasswordError(false);
    }

    // Prepare user data (you can POST this later)
    const userData = {
      email,
      username,
      password,
      role,
    };

    console.log('Signing up with:', userData);

    // Optional: redirect or show message
    navigate('/login');
  };

  return (
    <div>
      <header>
        <h1>
          <Link to="/stories">
            <img className="book" src={bookIcon} alt="book" />
            Create an Account
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
        <form id="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Password strength message */}
          {passwordError && (
            <small style={{ color: 'red' }}>
              Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.
            </small>
          )}

          <label htmlFor="role">Role:</label>
          <div id="role-container">
            <label htmlFor="author">
              <input
                type="radio"
                id="author"
                name="role"
                value="author"
                checked={role === 'author'}
                onChange={(e) => setRole(e.target.value)}
              />
              Author
            </label>

            <label htmlFor="reader">
              <input
                type="radio"
                id="reader"
                name="role"
                value="reader"
                checked={role === 'reader'}
                onChange={(e) => setRole(e.target.value)}
              />
              Reader
            </label>

            <label htmlFor="both">
              <input
                type="radio"
                id="both"
                name="role"
                value="both"
                checked={role === 'both'}
                onChange={(e) => setRole(e.target.value)}
              />
              Both
            </label>
          </div>

          <button type="submit">Sign Up</button>
        </form>
      </main>

      <footer>
        <p>&copy; 2025 Microfiction Library</p>
      </footer>
    </div>
  );
};

export default SignUp;
