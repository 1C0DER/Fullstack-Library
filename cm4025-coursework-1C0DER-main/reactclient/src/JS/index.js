require('dotenv').config();
const cors = require('cors');
const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const app = express();

// CORS setup - restrict to React dev server or production frontend
app.use(cors({
  origin: 'http://localhost:3000', // Change to your frontend URL in production
  credentials: true
}));

const uri = process.env.DBURI;
const client = new MongoClient(uri);

const submitStoryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many submissions from this IP, please try again later.'
});

app.use(express.json());
app.use('/api/storeStory', submitStoryLimiter);

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(403).json({ message: 'Invalid token.' });
  }
}

async function startServer() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");

    app.post('/api/storeStory', async (req, res) => {
      const { title, content, genre, visibility, guestName } = req.body;
      let authorId = null;
      const token = req.header('Authorization')?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          authorId = decoded.userId;
        } catch (error) {
          console.error('Invalid token:', error);
          return res.status(403).json({ message: 'Invalid token.' });
        }
      }
      const story = {
        title,
        content,
        genre,
        visibility,
        authorId,
        guestName: guestName || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0,
        ratingCount: 0
      };
      try {
        const result = await client.db("StryDB").collection("stories").insertOne(story);
        const insertedStory = await client.db("StryDB").collection("stories").findOne({ _id: result.insertedId });
        res.json({ message: 'Story created successfully!', story: insertedStory });
      } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Error creating story' });
      }
    });

    app.get('/api/userStories', authenticateToken, async (req, res) => {
      try {
        const stories = await client.db("StryDB").collection("stories").find({ authorId: req.user.userId }).toArray();
        res.json(stories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ message: 'Error fetching stories' });
      }
    });

    app.get('/api/getStories', async (req, res) => {
      try {
        const stories = await client.db("StryDB").collection("stories").find().toArray();
        const storiesWithUsernames = await Promise.all(stories.map(async (story) => {
          const user = await client.db("StryDB").collection("user").findOne({ _id: new ObjectId(story.authorId) });
          story.username = user ? user.username : 'Unknown';
          return story;
        }));
        res.json(storiesWithUsernames);
      } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ message: 'Error fetching stories' });
      }
    });

    app.post('/api/signUp', async (req, res) => {
      const { email, username, password, role } = req.body;
      if (!email || !username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { email, username, password: hashedPassword, role, createdAt: new Date() };
        await client.db("StryDB").collection("user").insertOne(user);
        res.json({ message: 'User registered successfully!', user: { email, username, role } });
      } catch (error) {
        console.error('Error storing user:', error.message);
        res.status(500).json({ message: 'Error storing user', error: error.message });
      }
    });

    app.post('/api/login', async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      try {
        const user = await client.db("StryDB").collection("user").findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, message: 'Login successful', token });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login error' });
      }
    });

    app.post('/api/rateStory', async (req, res) => {
      const { storyId, rating } = req.body;
      if (!storyId || !rating) return res.status(400).json({ message: 'Story ID and rating are required' });
      try {
        const story = await client.db("StryDB").collection("stories").findOne({ _id: new ObjectId(storyId) });
        if (!story) return res.status(404).json({ message: 'Story not found' });
        const newTotal = story.rating + parseInt(rating);
        const newCount = story.ratingCount + 1;
        await client.db("StryDB").collection("stories").updateOne(
          { _id: new ObjectId(storyId) },
          { $set: { rating: newTotal, ratingCount: newCount } }
        );
        res.json({ message: 'Rating submitted successfully', rating: newTotal, ratingCount: newCount });
      } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({ message: 'Rating error' });
      }
    });

    app.post('/api/updateStatus', async (req, res) => {
      const { userId, status } = req.body;
      if (!userId || !status) return res.status(400).json({ message: 'User ID and status are required' });
      try {
        const result = await client.db("StryDB").collection("user").updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: status } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: 'Status updated successfully' });
      } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ message: 'Status update error' });
      }
    });

    app.delete('/api/deleteStory', authenticateToken, async (req, res) => {
      const { storyId } = req.body;
      try {
        const result = await client.db("StryDB").collection("stories").deleteOne({ _id: new ObjectId(storyId), authorId: req.user.userId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Story not found or not yours' });
        res.json({ message: 'Story deleted successfully' });
      } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Delete error' });
      }
    });

    app.get('/api/topRatedStories', async (req, res) => {
      try {
        const topStories = await client.db("StryDB").collection("stories").find().sort({ rating: -1 }).limit(10).toArray();
        res.json(topStories);
      } catch (error) {
        console.error('Top stories error:', error);
        res.status(500).json({ message: 'Top stories error' });
      }
    });

    app.get('/api/filterStories', async (req, res) => {
      const { genre, excludeRead } = req.query;
      const userId = req.user ? req.user.userId : null;
      const filter = {};

      if (genre) filter.genre = genre;
      if (excludeRead === 'true' && userId) {
        const read = await client.db("StryDB").collection("readStories").find({ userId }).toArray();
        const readIds = read.map(story => story.storyId);
        filter._id = { $nin: readIds };
      }

      try {
        const stories = await client.db("StryDB").collection("stories").find(filter).toArray();
        res.json(stories);
      } catch (error) {
        console.error('Filter stories error:', error);
        res.status(500).json({ message: 'Filter stories error' });
      }
    });

    app.get('/api/topAuthors', async (req, res) => {
      try {
        const topAuthors = await client.db("StryDB").collection("stories").aggregate([
          { $group: { _id: "$authorId", totalRating: { $sum: "$rating" }, storyCount: { $sum: 1 } } },
          { $lookup: { from: 'user', localField: '_id', foreignField: '_id', as: 'author' } },
          { $unwind: "$author" },
          { $project: { authorName: "$author.username", totalRating: 1, storyCount: 1 } },
          { $sort: { totalRating: -1 } },
          { $limit: 10 }
        ]).toArray();
        res.json(topAuthors);
      } catch (error) {
        console.error('Top authors error:', error);
        res.status(500).json({ message: 'Top authors error' });
      }
    });

    app.use((req, res) => {
      res.status(404).send('This page does not exist!');
    });

    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}/`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

startServer();