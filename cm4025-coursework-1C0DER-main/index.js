require('dotenv').config();
const cors = require('cors');
const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');  // Import bcrypt for password hashing
const app = express();

app.use(cors());  // Enable CORS for all routes

// Get the DB URI and PORT from environment variables
const uri = process.env.DBURI;  // Use the DBURI environment variable
const client = new MongoClient(uri);

// Set up rate limiting for story submissions
const submitStoryLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 submissions per windowMs
    message: 'Too many submissions from this IP, please try again later.'
});

// Middleware to parse JSON data from incoming requests
app.use(express.json());
app.use('/api/storeStory', submitStoryLimiter);

// Define the path to your static frontend directory
const dir = path.join(__dirname, 'Frontend');  // Make sure this path matches where your files are
const options = { index: "HTML/stories.html" };  // Serve index.html by default
app.use(express.static(dir, options));  // This will serve all files in the 'Frontend' folder

// Authentication Middleware to validate JWT token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify and decode the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach user data to the request object
        next();  // Proceed to the next middleware/route handler
    } catch (error) {
        console.error('Invalid token:', error);
        return res.status(403).json({ message: 'Invalid token.' });
    }
}

// MongoDB connection handler (ensures connection is established before routes are handled)
async function startServer() {
    try {
        await client.connect();  // Connect to MongoDB
        console.log("MongoDB connected successfully");

// Route to handle the storing of the "quote" or "story"
// Route to handle the storing of the "quote" or "story"
app.post('/api/storeStory', async (req, res) => {
    const { title, content, genre, visibility, guestName } = req.body;

    let authorId = null;  // Default to null if no user is logged in

    // Check if the request has an Authorization header
    const token = req.header('Authorization')?.split(' ')[1];  // Extract token from Authorization header

    if (token) {
        try {
            // Verify and decode the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            authorId = decoded.userId;  // Use the userId from the JWT token
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
        authorId: authorId,  // Link to the user via their user ID (or null for guest)
        guestName: guestName || null,  // Store the guest's name if provided
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0,  // Default rating value
        ratingCount: 0  // Default rating count
    };

    try {
        // Insert the story into the 'stories' collection
        const result = await client.db("StryDB").collection("stories").insertOne(story);

        // Fetch the inserted story using the insertedId
        const insertedStory = await client.db("StryDB").collection("stories").findOne({ _id: result.insertedId });

        res.json({
            message: 'Story created successfully!',
            story: insertedStory  // Send the newly inserted story data
        });
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Error creating story' });
    }
});




        // Get all stories by the logged-in user
        app.get('/api/userStories', authenticateToken, async (req, res) => {
            const userId = req.user.userId;  // Get userId from JWT token

            try {
                // Find stories that belong to the current user
                const stories = await client.db("StryDB").collection("stories").find({ authorId: userId }).toArray();
                res.json(stories);
            } catch (error) {
                console.error('Error fetching stories:', error);
                res.status(500).json({ message: 'Error fetching stories' });
            }
        });

        // GET all stories (no authentication)
        app.get('/api/getStories', async (req, res) => {
            try {
                // Fetch all stories from the 'stories' collection
                const stories = await client.db("StryDB").collection("stories").find().toArray();
        
                // For each story, fetch the username from the 'user' collection based on the authorId
                const storiesWithUsername = await Promise.all(stories.map(async (story) => {
                    const user = await client.db("StryDB").collection("user").findOne({ _id: new ObjectId(story.authorId) });
                    story.username = user ? user.username : 'Unknown';  // If user not found, set username to 'Unknown'
                    return story;
                }));
        
                res.json(storiesWithUsername);
            } catch (error) {
                console.error('Error fetching stories:', error);
                res.status(500).json({ message: 'Error fetching stories' });
            }
        });               

        // Route for user sign-up (register)
        app.post('/api/signUp', async (req, res) => {
            const { email, username, password, role } = req.body;

            if (!email || !username || !password || !role) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = {
                    email,
                    username,
                    password: hashedPassword,  // Store the hashed password
                    role,
                    createdAt: new Date(),
                };

                const result = await client.db("StryDB").collection("user").insertOne(user);

                res.json({
                    message: 'User registered successfully!',
                    user: { email, username, role }
                });
            } catch (error) {
                console.error('Error storing user in the database:', error.message);
                res.status(500).json({ message: 'Error storing user in the database', error: error.message });
            }
        });

        // Route for user login (authentication)
        app.post('/api/login', async (req, res) => {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            try {
                const collection = client.db("StryDB").collection("user");

                const user = await collection.findOne({ username });

                if (!user) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                const isPasswordCorrect = await bcrypt.compare(password, user.password);

                if (!isPasswordCorrect) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                // Generate a JWT token
                const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });

                res.json({
                    success: true,
                    message: 'Login successful',
                    token: token  // Send the token to the frontend
                });
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).json({ message: 'Error during login' });
            }
        });

        app.post('/api/rateStory', async (req, res) => {
            const { storyId, rating } = req.body;
        
            if (!storyId || !rating) {
                return res.status(400).json({ message: 'Story ID and rating are required' });
            }
        
            try {
                const story = await client.db("StryDB").collection("stories").findOne({ _id: new ObjectId(storyId) });
        
                if (!story) {
                    return res.status(404).json({ message: 'Story not found' });
                }
        
                // Add the new rating to the existing total rating sum
                const newTotalRating = story.rating + parseInt(rating);
                const newRatingCount = story.ratingCount + 1;
        
                // Update the story with the new total rating sum and count
                const result = await client.db("StryDB").collection("stories").updateOne(
                    { _id: new ObjectId(storyId) },
                    {
                        $set: { 
                            rating: newTotalRating,  // Update the total rating sum (no average calculation)
                            ratingCount: newRatingCount  // Increment the rating count
                        }
                    }
                );
        
                // Send back the updated total rating sum and rating count
                res.json({
                    message: 'Rating submitted successfully',
                    rating: newTotalRating,  // Send the updated total rating sum
                    ratingCount: newRatingCount  // Send the updated rating count
                });
            } catch (error) {
                console.error('Error submitting rating:', error);
                res.status(500).json({ message: 'Error submitting rating' });
            }
        });
        

        // Route to update user status
        app.post('/api/updateStatus', async (req, res) => {
            const { userId, status } = req.body;

            if (!userId || !status) {
                return res.status(400).json({ message: 'User ID and status are required' });
            }

            try {
                const objectId = new ObjectId(userId);

                const result = await client.db("StryDB").collection("user").updateOne(
                    { _id: objectId },
                    { $set: { role: status } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                res.json({ success: true, message: 'Status updated successfully' });
            } catch (error) {
                console.error('Error updating status:', error);
                res.status(500).json({ message: 'Error updating status' });
            }
        });

        app.delete('/api/deleteStory', authenticateToken, async (req, res) => {
            const { storyId } = req.body;
            const userId = req.user.userId;  // Get user ID from JWT token
        
            try {
                const result = await client.db("StryDB").collection("stories").deleteOne(
                    { _id: new ObjectId(storyId), authorId: userId }  // Ensure the story belongs to the logged-in user
                );
        
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Story not found or you are not the author' });
                }
        
                res.json({ message: 'Story deleted successfully' });
            } catch (error) {
                console.error('Error deleting story:', error);
                res.status(500).json({ message: 'Error deleting story' });
            }
        });

        // Route to get top-rated stories
app.get('/api/topRatedStories', async (req, res) => {
    try {
        // Fetch the top-rated stories ordered by the average rating in descending order
        const topRatedStories = await client.db("StryDB").collection("stories")
            .find()
            .sort({ rating: -1 })  // Sort by rating in descending order
            .limit(10)  // Limit to top 10 stories (adjust as needed)
            .toArray();

        // Send the top-rated stories as a response
        res.json(topRatedStories);
    } catch (error) {
        console.error('Error fetching top-rated stories:', error);
        res.status(500).json({ message: 'Error fetching top-rated stories' });
    }
});

app.get('/api/filterStories', async (req, res) => {
    const { genre, excludeRead } = req.query;  // Get the genre and whether to exclude read stories
    const userId = req.user ? req.user.userId : null;  // Check if user is logged in

    let filter = {};

    // If the user wants to exclude stories they've already read
    if (excludeRead === 'true' && userId) {
        // Fetch the user's read stories (assuming you have a 'readStories' collection or similar)
        const readStories = await client.db("StryDB").collection("readStories").find({ userId }).toArray();
        const readStoryIds = readStories.map(story => story.storyId);

        filter._id = { $nin: readStoryIds };  // Exclude these stories
    }

    // If a genre is selected, filter by genre
    if (genre) {
        filter.genre = genre;
    }

    try {
        // Fetch the stories based on the filter
        const stories = await client.db("StryDB").collection("stories").find(filter).toArray();
        res.json(stories);  // Send the filtered stories as a response
    } catch (error) {
        console.error('Error fetching filtered stories:', error);
        res.status(500).json({ message: 'Error fetching filtered stories' });
    }
});

app.get('/api/topAuthors', async (req, res) => {
    try {
        const topAuthors = await client.db("StryDB").collection("stories")
            .aggregate([
                { $group: { _id: "$authorId", totalRating: { $sum: "$rating" }, storyCount: { $sum: 1 } } },
                { $lookup: {
                    from: 'user',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'author'
                }},
                { $unwind: "$author" },
                { $project: { authorName: "$author.username", totalRating: 1, storyCount: 1 } },
                { $sort: { totalRating: -1 } }, // Sort by totalRating
                { $limit: 10 }  // Limit to top 10 authors
            ])
            .toArray();
        
        res.json(topAuthors);
    } catch (error) {
        console.error('Error fetching top authors:', error);
        res.status(500).json({ message: 'Error fetching top authors' });
    }
});

        // 404 Error handler for any invalid routes
        app.use((req, res) => {
            res.status(404).send('This page does not exist!');
        });

        // Get the PORT from the environment or default to 8080
        const port = process.env.PORT || 8080;

        // Start the server on the specified port
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}/`);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Start the server after MongoDB connection
startServer();