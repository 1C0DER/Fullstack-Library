import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthorRankings from './pages/AuthorRank';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import Stories from './pages/stories';
import StoryRank from './pages/StoryRank';
import StorySubmit from './pages/StorySubmit';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Stories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/authorrank" element={<AuthorRankings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/storyrank" element={<StoryRank />} />
          <Route path="/submitstory" element={<StorySubmit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
