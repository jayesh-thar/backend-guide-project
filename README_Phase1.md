# 📋 Job Application Tracker — Backend API

> Your first real backend project. Built with Node.js, Express, and MongoDB.
> No frontend needed — test everything with Postman.

---

## 🧠 What You're Building

A REST API where users can **register, login, and track their internship/job applications.**
Every user has their own private list of applications they can add, update, and delete.

This is a real-world use case — you'll actually use this while applying to startups.

---

## 🎯 What You'll Learn By Building This

| Concept | Where You'll Use It |
|---|---|
| Folder structure | Organizing your whole project |
| Mongoose Models | Defining User and Application schemas |
| Express Router | Separating routes cleanly |
| Controllers | Keeping logic out of routes |
| JWT Auth | Login and protecting routes |
| Middleware | Verifying token on every protected route |
| dotenv | Hiding secrets like DB URL and JWT secret |
| Error Handling | Sending proper error responses |
| Postman Testing | Testing every API you build |

---

## 🗂 Folder Structure

```
job-tracker-backend/
│
├── config/
│   └── db.js                  # MongoDB connection
│
├── controllers/
│   ├── authController.js      # Register and Login logic
│   └── applicationController.js  # CRUD logic for applications
│
├── middleware/
│   └── authMiddleware.js      # Verify JWT token
│
├── models/
│   ├── User.js                # User schema
│   └── Application.js         # Application schema
│
├── routes/
│   ├── authRoutes.js          # /api/auth routes
│   └── applicationRoutes.js   # /api/applications routes
│
├── .env                       # Secret keys (never push to GitHub)
├── .gitignore                 # Ignore node_modules and .env
├── package.json
└── server.js                  # Entry point — app starts here
```

---

## ⚙️ Tech Stack

| Tool | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework — handling routes |
| MongoDB | Database |
| Mongoose | ODM — connecting MongoDB with Node |
| bcryptjs | Hashing passwords before saving |
| jsonwebtoken | Creating and verifying JWT tokens |
| dotenv | Loading environment variables |
| nodemon | Auto-restart server on file change |

---

## 📦 Installation & Setup

### Step 1 — Clone or create the project

```bash
mkdir job-tracker-backend
cd job-tracker-backend
npm init -y
```

### Step 2 — Install all dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon
```

### Step 3 — Add nodemon script to package.json

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

### Step 4 — Create your .env file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_key_anything_random
```

> ⚠️ Never push .env to GitHub. Add it to .gitignore.

### Step 5 — Start the server

```bash
npm run dev
```

---

## 🗄 Database Models

### User Model — `models/User.js`

```js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
```

### Application Model — `models/Application.js`

```js
const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'rejected', 'offered'],
    default: 'applied'
  },
  dateApplied: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('Application', applicationSchema)
```

---

## 🔐 Authentication Flow

```
User registers → password gets hashed → saved to DB
User logs in   → password compared → JWT token returned
User hits protected route → token checked in middleware → access granted or denied
```

### Auth Controller — `controllers/authController.js`

```js
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({ name, email, password: hashedPassword })

    res.status(201).json({ message: 'User registered successfully', userId: user._id })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(200).json({ message: 'Login successful', token })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login }
```

---

## 🛡 Auth Middleware — `middleware/authMiddleware.js`

```js
const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = protect
```

---

## 📁 Application Controller — `controllers/applicationController.js`

```js
const Application = require('../models/Application')

// CREATE — Add new application
const createApplication = async (req, res) => {
  try {
    const { company, role, status, notes } = req.body

    const application = await Application.create({
      user: req.userId,
      company,
      role,
      status,
      notes
    })

    res.status(201).json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// READ ALL — Get all applications of logged in user
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.userId }).sort({ createdAt: -1 })
    res.status(200).json(applications)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// READ ONE — Get single application
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE — Update status or notes
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    )

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE — Remove application
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.userId })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json({ message: 'Application deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication
}
```

---

## 🛣 Routes

### Auth Routes — `routes/authRoutes.js`

```js
const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)

module.exports = router
```

### Application Routes — `routes/applicationRoutes.js`

```js
const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController')

// All routes below are protected — need JWT token
router.use(protect)

router.post('/', createApplication)
router.get('/', getApplications)
router.get('/:id', getApplicationById)
router.put('/:id', updateApplication)
router.delete('/:id', deleteApplication)

module.exports = router
```

---

## 🚀 Server Entry Point — `server.js`

```js
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/applications', require('./routes/applicationRoutes'))

// Base route
app.get('/', (req, res) => {
  res.send('Job Tracker API is running...')
})

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => console.log('DB connection error:', err))
```

---

## 🧪 API Endpoints — Test With Postman

### Auth Endpoints

| Method | Endpoint | Body | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | `name, email, password` | ❌ No |
| POST | `/api/auth/login` | `email, password` | ❌ No |

### Application Endpoints

| Method | Endpoint | Body | Auth Required |
|---|---|---|---|
| POST | `/api/applications` | `company, role, status, notes` | ✅ Yes |
| GET | `/api/applications` | — | ✅ Yes |
| GET | `/api/applications/:id` | — | ✅ Yes |
| PUT | `/api/applications/:id` | any field to update | ✅ Yes |
| DELETE | `/api/applications/:id` | — | ✅ Yes |

> ✅ For protected routes — add this to Postman Headers:
> `Authorization: Bearer your_token_here`

---

## 🧪 Sample Request Bodies

### Register
```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "password123"
}
```

### Login
```json
{
  "email": "you@example.com",
  "password": "password123"
}
```

### Add Application
```json
{
  "company": "Razorpay",
  "role": "Backend Intern",
  "status": "applied",
  "notes": "Applied via LinkedIn. Referral from college senior."
}
```

### Update Application
```json
{
  "status": "interview",
  "notes": "Got interview call. Round 1 on March 20."
}
```

---

## 🔁 Build Order — Follow This Exactly

```
Step 1 →  Setup project, install packages, create .env
Step 2 →  server.js — basic express server running on port 5000
Step 3 →  config/db.js — connect MongoDB
Step 4 →  models/User.js — create User schema
Step 5 →  controllers/authController.js — register and login logic
Step 6 →  routes/authRoutes.js — connect routes to controller
Step 7 →  Test register and login in Postman ✅
Step 8 →  middleware/authMiddleware.js — JWT verification
Step 9 →  models/Application.js — create Application schema
Step 10 → controllers/applicationController.js — all CRUD logic
Step 11 → routes/applicationRoutes.js — connect with protect middleware
Step 12 → Test all 5 application APIs in Postman ✅
Step 13 → Deploy on Render or Railway 🚀
```

---

## 🚫 Common Mistakes to Avoid

- **Don't push .env to GitHub** — add it to .gitignore immediately
- **Don't skip error handling** — always wrap async code in try/catch
- **Don't store plain passwords** — always hash with bcrypt before saving
- **Don't forget `express.json()`** — without this, req.body will be undefined
- **Always check ownership** — when fetching/updating, always filter by `user: req.userId`

---

## ✅ Done? Check These Off

- [ ] Server runs without errors
- [ ] MongoDB connects successfully
- [ ] Register API works in Postman
- [ ] Login API returns JWT token
- [ ] Protected routes reject requests without token
- [ ] Can add a new application
- [ ] Can get all applications
- [ ] Can update application status
- [ ] Can delete an application
- [ ] Deployed live with proper environment variables

---

## 📌 After This Project

Once this is done and deployed — you're ready to:

1. Add TypeScript to this same project
2. Move to Next.js
3. Build Project 2 with PostgreSQL

> One project done and deployed is worth more than 10 tutorials watched.
> Build it. Break it. Fix it. That's how you learn.
