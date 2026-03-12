# 📋 Job Application Tracker — Phase 2: Production-Level Error Handling

> Phase 1 gave you a working API.
> Phase 2 makes it bulletproof.
> A real frontend dev will send garbage — your API needs to handle everything gracefully.

---

## 🧠 What You're Fixing in Phase 2

> Think of it like this — you built a toy in Phase 1.
> Now a child (frontend dev) is going to pull every wire, poke every hole, and send completely random stuff.
> Your job is to make sure nothing breaks — just clean error messages back.

| Problem | What Frontend Might Send | What Should Happen |
|---|---|---|
| Empty fields | `name: ""` | 400 — "Name is required" |
| Invalid email | `email: "abc"` | 400 — "Enter a valid email" |
| Short password | `password: "12"` | 400 — "Password must be at least 6 characters" |
| Invalid MongoDB ID | `/applications/randomgarbage` | 400 — "Invalid ID format" |
| Expired JWT | old token | 401 — "Session expired, please login again" |
| Empty update body | `PUT` with `{}` | 400 — "Nothing to update" |
| Invalid status value | `status: "pending"` | 400 — "Invalid status value" |
| No CORS header | request from frontend port | proper CORS response |
| Huge request body | 10MB JSON | 413 — "Payload too large" |
| Broken JSON body | malformed JSON | 400 — "Invalid JSON" |
| Route not found | `/api/somethingwrong` | 404 — "Route not found" |

---

## 📦 New Packages to Install

```bash
npm install express-validator cors
```

| Package | Purpose |
|---|---|
| express-validator | Validate and sanitize incoming request fields |
| cors | Allow frontend from different origin to hit your API |

---

## 🗂 Updated Folder Structure

```
job-tracker-backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js         # Updated with validation checks
│   └── applicationController.js  # Updated with all edge case handling
│
├── middleware/
│   ├── authMiddleware.js          # Updated with better token error messages
│   ├── validateMiddleware.js      # NEW — runs validation before controller
│   └── errorMiddleware.js         # NEW — global error handler
│
├── models/
│   ├── User.js
│   └── Application.js
│
├── routes/
│   ├── authRoutes.js              # Updated — validators added
│   └── applicationRoutes.js       # Updated — validators added
│
├── utils/
│   └── validateObjectId.js        # NEW — MongoDB ID format checker
│
├── .env
├── .gitignore
├── package.json
└── server.js                      # Updated — CORS, size limit, error handler
```

---

## 🛠 What to Update and Add — In Order

```
Step 1 →  Install new packages
Step 2 →  Update server.js — CORS, body size limit, JSON error handler
Step 3 →  Create middleware/errorMiddleware.js — global error catcher
Step 4 →  Create utils/validateObjectId.js — ID format checker
Step 5 →  Update middleware/authMiddleware.js — better token errors
Step 6 →  Create middleware/validateMiddleware.js — input validators
Step 7 →  Update routes/authRoutes.js — attach validators
Step 8 →  Update routes/applicationRoutes.js — attach validators
Step 9 →  Update controllers/authController.js — use validationResult
Step 10 → Update controllers/applicationController.js — all edge cases
Step 11 → Test every broken case in Postman ✅
```

---

## 🚀 Updated server.js

```js
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const app = express()

// ── CORS — allow frontend to connect ──────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// ── Body size limit — reject huge payloads ────────────────────────────────
app.use(express.json({ limit: '10kb' }))

// ── Handle malformed JSON body ────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' })
  }
  next(err)
})

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/applications', require('./routes/applicationRoutes'))

// ── Base route ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Job Tracker API is running...')
})

// ── 404 — Route not found ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler — catches everything else ────────────────────────
app.use(require('./middleware/errorMiddleware'))

// ── Connect DB and start ──────────────────────────────────────────────────
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

## 🔴 Global Error Middleware — `middleware/errorMiddleware.js`

```js
const errorHandler = (err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  // Mongoose duplicate key — e.g. email already exists
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ message: `${field} already exists` })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Session expired, please login again' })
  }

  // Mongoose cast error — invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  // Default fallback
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error'
  })
}

module.exports = errorHandler
```

---

## 🆔 ObjectId Validator — `utils/validateObjectId.js`

```js
const mongoose = require('mongoose')

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

module.exports = isValidObjectId
```

> Use this before any DB call that uses `:id` from params.
> If ID format is wrong — reject immediately, don't even touch the database.

---

## 🛡 Updated Auth Middleware — `middleware/authMiddleware.js`

```js
const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  // No token at all
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  // Token exists but wrong format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token format. Use: Bearer <token>' })
  }

  const token = authHeader.split(' ')[1]

  // Empty token after Bearer
  if (!token || token.trim() === '') {
    return res.status(401).json({ message: 'Token is empty' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please login again.' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' })
    }
    res.status(401).json({ message: 'Authentication failed' })
  }
}

module.exports = protect
```

---

## ✅ Input Validators — `middleware/validateMiddleware.js`

```js
const { body, validationResult } = require('express-validator')

// ── Run validation result ─────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// ── Register validation rules ─────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

// ── Login validation rules ────────────────────────────────────────────────
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
]

// ── Application validation rules ──────────────────────────────────────────
const applicationRules = [
  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Company name too long'),

  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isLength({ min: 1, max: 100 }).withMessage('Role name too long'),

  body('status')
    .optional()
    .isIn(['applied', 'interview', 'rejected', 'offered'])
    .withMessage('Status must be one of: applied, interview, rejected, offered'),

  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
]

// ── Update validation rules ───────────────────────────────────────────────
const updateRules = [
  body('company')
    .optional()
    .trim()
    .notEmpty().withMessage('Company name cannot be empty')
    .isLength({ max: 100 }).withMessage('Company name too long'),

  body('role')
    .optional()
    .trim()
    .notEmpty().withMessage('Role cannot be empty')
    .isLength({ max: 100 }).withMessage('Role name too long'),

  body('status')
    .optional()
    .isIn(['applied', 'interview', 'rejected', 'offered'])
    .withMessage('Status must be one of: applied, interview, rejected, offered'),

  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
]

module.exports = { validate, registerRules, loginRules, applicationRules, updateRules }
```

---

## 🛣 Updated Auth Routes — `routes/authRoutes.js`

```js
const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')
const { registerRules, loginRules, validate } = require('../middleware/validateMiddleware')

router.post('/register', registerRules, validate, register)
router.post('/login',    loginRules,    validate, login)

module.exports = router
```

---

## 🛣 Updated Application Routes — `routes/applicationRoutes.js`

```js
const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { applicationRules, updateRules, validate } = require('../middleware/validateMiddleware')
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController')

router.use(protect)

router.post('/',    applicationRules, validate, createApplication)
router.get('/',                                 getApplications)
router.get('/:id',                              getApplicationById)
router.put('/:id',  updateRules,      validate, updateApplication)
router.delete('/:id',                           deleteApplication)

module.exports = router
```

---

## 📁 Updated Application Controller — `controllers/applicationController.js`

```js
const Application = require('../models/Application')
const isValidObjectId = require('../utils/validateObjectId')

// CREATE
const createApplication = async (req, res) => {
  try {
    const { company, role, status, notes } = req.body

    const application = await Application.create({
      user: req.userId,
      company,
      role,
      status: status || 'applied',
      notes: notes || ''
    })

    res.status(201).json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// READ ALL
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.userId }).sort({ createdAt: -1 })

    if (applications.length === 0) {
      return res.status(200).json({ message: 'No applications yet', data: [] })
    }

    res.status(200).json({ total: applications.length, data: applications })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// READ ONE
const getApplicationById = async (req, res) => {
  try {
    // Check ID format first
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' })
    }

    const application = await Application.findOne({ _id: req.params.id, user: req.userId })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE
const updateApplication = async (req, res) => {
  try {
    // Check ID format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' })
    }

    // Check empty body
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Nothing to update. Send at least one field.' })
    }

    // Remove fields that should never be updated directly
    const { user, _id, createdAt, ...updateData } = req.body

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    )

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    res.status(200).json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE
const deleteApplication = async (req, res) => {
  try {
    // Check ID format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID format' })
    }

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

## 🧪 Phase 2 — Postman Testing Checklist

### Auth — Break It On Purpose

| Test | What to Send | Expected Response |
|---|---|---|
| Register with empty name | `name: ""` | 400 — Name is required |
| Register with invalid email | `email: "abc"` | 400 — Enter a valid email |
| Register with short password | `password: "123"` | 400 — At least 6 characters |
| Register same email twice | same email | 400 — email already exists |
| Login with wrong password | wrong password | 401 — Invalid credentials |
| Login with missing email | no email field | 400 — Email is required |

### Token — Break It On Purpose

| Test | What to Send | Expected Response |
|---|---|---|
| No Authorization header | nothing | 401 — No token provided |
| Wrong format | `Token abc123` | 401 — Invalid token format |
| Empty bearer | `Bearer ` | 401 — Token is empty |
| Fake token | `Bearer randomstuff` | 401 — Invalid token |
| Expired token | old token | 401 — Session expired |

### Applications — Break It On Purpose

| Test | What to Send | Expected Response |
|---|---|---|
| Invalid ID in URL | `/api/applications/abc123` | 400 — Invalid ID format |
| Non-existent ID | valid format but wrong ID | 404 — Not found |
| Empty PUT body | `{}` | 400 — Nothing to update |
| Wrong status value | `status: "pending"` | 400 — Invalid status value |
| Company too long | 200 character company name | 400 — Company name too long |
| Notes too long | 600 character notes | 400 — Notes cannot exceed 500 |

### Server Level

| Test | What to Send | Expected Response |
|---|---|---|
| Wrong route | `/api/somethingwrong` | 404 — Route not found |
| Broken JSON | `{ "name": ` (incomplete) | 400 — Invalid JSON |

---

## 🔁 .env Update

Add this to your `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

---

## ✅ Phase 2 Done Checklist

- [ ] CORS setup working
- [ ] Body size limit applied
- [ ] Malformed JSON returns clean error
- [ ] Unknown routes return 404
- [ ] Global error handler catching all errors
- [ ] Register validates all fields properly
- [ ] Login validates all fields properly
- [ ] Application creation validates all fields
- [ ] Invalid MongoDB ID returns 400 not 500
- [ ] Empty update body returns 400
- [ ] Wrong status value rejected
- [ ] Expired token returns proper message
- [ ] All Postman break tests passing ✅

---

## 📌 Rule of Thumb for Backend

> **Never trust anything that comes from the frontend.**
> Validate everything. Handle every case. Return clear messages.
> Your API should never crash — only respond.
