# 📚 Fullstack Library Web Application

## 📌 Overview
This project is a full-stack web application that allows users to create, view, and interact with stories. It includes authentication, role-based functionality, and a dynamic database-backed system for managing content.

---

## Features

### User System
- User registration with strong password validation
- Secure login using JWT authentication
- Passwords stored using encryption
- Role selection (Author, Reader, Both)
- Profile access restricted to authenticated users
- Ability to update user role dynamically

---

### Story Management
- Create and submit stories
- Set stories as public or private
- Assign genres to stories
- Guest users can submit stories (with a name)
- Authors can delete their stories
- Stories display:
  - Title
  - Genre
  - Status (public/private)
  - Author username
  - Rating count
  - Number of voters

---

### Interaction & Ranking
- Users can rate stories
- Story ranking page sorts based on ratings
- Filtering system to find stories by genre

---

### Security & Middleware
- JWT (JSON Web Token) for authentication
- Express rate limiting to prevent spam actions
- Local storage used for storing auth tokens on frontend

---

## 🛠️ Tech Stack
- Node.js  
- Express.js  
- MongoDB  
- JSON Web Tokens (JWT)  
- HTML / CSS / JavaScript  

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/1C0DER/Fullstack-Library.git
cd Fullstack-Library
```

---

### 2. Run Setup Script
```bash
./setup.sh
```

If the script fails, run commands manually line by line.

---

### 3. Environment Variables
Create a `.env` file in:

~/microfiction/cm4025-coursework-1C0DER/

Add:

DBURI=mongodb://127.0.0.1:27017/StryDB
JWT_SECRET=your_jwt_secret_key
PORT=8080

---

### 4. Start the Application
```bash
node index.js
```

---

### 5. Access the App

Option A:
http://localhost:8080/

Option B:
Find your IP address:
```bash
ip a
```

Then open:
http://<your-ip-address>:8080/

---

## Functionality Summary
- View all stories on homepage
- Filter stories by genre
- Sign up / log in users
- Submit and manage stories
- Rate stories
- View ranked stories
- Role-based user system
