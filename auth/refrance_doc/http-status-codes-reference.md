# 📡 HTTP Status Codes — Complete Reference

> Every possible status code you will use in backend development.
> When in doubt — check here first.

---

## Quick Reference Table

| Code | Name | Meaning | Used When |
|---|---|---|---|
| 200 | OK | Success | General success |
| 201 | Created | Resource created | Register, new record |
| 204 | No Content | Success, no body | Delete success |
| 400 | Bad Request | Client sent wrong data | Validation failed |
| 401 | Unauthorized | Not logged in | No/invalid token |
| 403 | Forbidden | Logged in but no permission | Wrong role/access |
| 404 | Not Found | Resource doesn't exist | User/item not found |
| 409 | Conflict | Duplicate resource | Email already exists |
| 422 | Unprocessable | Validation error | Wrong data format |
| 429 | Too Many Requests | Rate limit hit | Brute force blocked |
| 500 | Internal Server Error | Server crashed | Unexpected error |
| 501 | Not Implemented | Feature not built yet | Coming soon feature |
| 503 | Service Unavailable | Server down | DB connection failed |

---

## 2xx — Success Codes

### 200 — OK
>
> General success. Request worked. Data returned.

```javascript
// When to use:
// - Login success
// - Logout success
// - Fetch data success
// - Update success
// - Any general success with data returned

return res.status(200).json({
    success: true,
    message: "Login successful",
    data: { ... }
})
```

Common messages:

```
"Login successful"
"Logout successful"
"Password reset successful"
"Data fetched successfully"
"Profile updated successfully"
```

---

### 201 — Created
>
> Something new was created in DB.

```javascript
// When to use:
// - Register new user
// - Create new post/product/record
// - Any time a new document is saved to DB

return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { ... }
})
```

Common messages:

```
"User registered successfully"
"Account created successfully"
"Post created successfully"
"Product added successfully"
```

---

### 204 — No Content
>
> Success but nothing to send back.

```javascript
// When to use:
// - Delete operations (nothing to return after delete)
// - Update with no response needed

return res.status(204).send()
// NOTE: no .json() — 204 sends empty body
```

Common messages:

```
(no body sent — just status code)
```

---

## 4xx — Client Error Codes

> These mean the CLIENT made a mistake — wrong data, not logged in, etc.

---

### 400 — Bad Request
>
> Client sent wrong, missing, or invalid data.

```javascript
// When to use:
// - Missing required fields
// - Invalid field format
// - Password too short
// - Wrong password on login
// - Passwords don't match
// - Invalid data type

return res.status(400).json({
    success: false,
    message: "Some fields are missing"
})
```

Common messages:

```
"Some fields are missing, please fill all fields"
"Password must be at least 6 characters"
"Invalid email format"
"Password is incorrect"
"Passwords do not match"
"Invalid date format"
"Token is invalid or expired"        ← reset password token
"Please provide a valid input"
```

---

### 401 — Unauthorized
>
> User is NOT logged in. No valid token provided.

```javascript
// When to use:
// - No token in cookie/header
// - Token is expired
// - Token is tampered/invalid
// - Refresh token missing
// - Refresh token expired

return res.status(401).json({
    success: false,
    message: "Unauthorized - Please login"
})
```

Common messages:

```
"Unauthorized - No token provided"
"Unauthorized - Token expired"
"Unauthorized - Invalid token"
"Unauthorized - Token tampered"
"Session expired - Please login again"
"Refresh token missing - Please login"
"Invalid session - Please login again"
"Please login to continue"
```

> ⚠️ 401 vs 403 — Common confusion:
> 401 = "Who are you?" — not logged in
> 403 = "I know who you are, but NO" — logged in but no permission

---

### 403 — Forbidden
>
> User IS logged in but doesn't have permission for this action.

```javascript
// When to use:
// - Regular user trying to access admin route
// - User trying to edit another user's data
// - Account suspended/banned
// - Email not verified (access restricted)

return res.status(403).json({
    success: false,
    message: "Access denied - Admins only"
})
```

Common messages:

```
"Access denied - Insufficient permissions"
"Admin access required"
"You can only edit your own profile"
"Your account has been suspended"
"Please verify your email first"
"You don't have permission to perform this action"
```

---

### 404 — Not Found
>
> The requested resource doesn't exist in DB.

```javascript
// When to use:
// - User with given email/id not found
// - Product/post not found
// - Route doesn't exist

return res.status(404).json({
    success: false,
    message: "User not found"
})
```

Common messages:

```
"User not found"
"User with this email does not exist"
"Product not found"
"Post not found"
"Page not found"
"Resource not found"
"No account found with this email"
```

---

### 409 — Conflict
>
> Resource already exists — duplicate entry.

```javascript
// When to use:
// - Email already registered
// - Username already taken
// - Duplicate entry in DB

return res.status(409).json({
    success: false,
    message: "Email already registered"
})
```

Common messages:

```
"Email already registered"
"Username already taken"
"Account already exists with this email"
"Phone number already in use"
```

> 💡 Note: Many projects use 400 for this too — both are acceptable.
> 409 is more semantically correct for duplicates.

---

### 422 — Unprocessable Entity
>
> Server understood request but data failed validation.

```javascript
// When to use:
// - Data format is correct but values are wrong
// - Schema validation failed
// - Business logic validation failed

return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: [
        { field: "email", message: "Invalid email format" },
        { field: "age", message: "Must be 18 or older" }
    ]
})
```

Common messages:

```
"Validation failed"
"Invalid input data"
"Please check your input and try again"
```

> 💡 Note: 400 vs 422 — both used for validation.
> 400 = general bad request
> 422 = specifically validation failed
> In small projects — just use 400 for everything validation related.

---

### 429 — Too Many Requests
>
> Rate limit exceeded. Client sent too many requests.

```javascript
// When to use:
// - Rate limiter blocks request
// - express-rate-limit sends this automatically
// - Brute force attempt detected

// express-rate-limit handles this automatically
// but you can customize the message:
const limiter = rateLimit({
    message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes."
    }
})
```

Common messages:

```
"Too many requests - Please try again later"
"Too many login attempts - Try again after 15 minutes"
"Rate limit exceeded - Slow down"
"Too many requests from this IP"
```

---

## 5xx — Server Error Codes

> These mean the SERVER made a mistake — not the client's fault.

---

### 500 — Internal Server Error
>
> Something unexpected crashed on the server.

```javascript
// When to use:
// - DB connection failed mid-request
// - Unexpected JS error
// - Any error caught in catch block
// - Third party service failed (email etc.)

catch(error) {
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message    // only show in development
    })
}
```

Common messages:

```
"Internal server error"
"Server error - Please try again later"
"Something went wrong on our end"
"Database error"
"Email service unavailable"
```

> ⚠️ In production — never expose error.message to client.
> It may leak sensitive server information.
> Use a generic message instead.

---

### 503 — Service Unavailable
>
> Server is up but something it depends on is down.

```javascript
// When to use:
// - Database is down
// - External API is unreachable
// - Server is overloaded

return res.status(503).json({
    success: false,
    message: "Service temporarily unavailable"
})
```

Common messages:

```
"Service temporarily unavailable"
"Database connection failed"
"Please try again in a few minutes"
"We are experiencing technical difficulties"
```

---

## Auth-Specific Status Code Guide

> Specifically for our AuthFlow project — which code to use where:

### Register `POST /api/auth/register`

```
Missing fields          → 400  "Some fields are missing"
Invalid email format    → 400  "Please enter a valid email"
Password too short      → 400  "Password must be at least 6 characters"
Email already exists    → 409  "Email already registered"
User created            → 201  "User registered successfully"
Server error            → 500  "Internal server error"
```

### Login `POST /api/auth/login`

```
Missing fields          → 400  "Email or password is missing"
User not found          → 404  "No account found with this email"
Wrong password          → 400  "Incorrect password"
Login success           → 200  "Login successful"
Server error            → 500  "Internal server error"
```

### Logout `POST /api/auth/logout`

```
Logout success          → 200  "Logged out successfully"
Server error            → 500  "Internal server error"
```

### Forgot Password `POST /api/auth/forgot-password`

```
Missing email           → 400  "Please provide your email"
User not found          → 404  "No account found with this email"
Email sent              → 200  "Password reset email sent"
Server error            → 500  "Internal server error"
```

### Reset Password `POST /api/auth/reset-password/:token`

```
Missing new password    → 400  "Please provide new password"
Token invalid/expired   → 400  "Reset link is invalid or expired"
Password too short      → 400  "Password must be at least 6 characters"
Reset success           → 200  "Password reset successfully"
Server error            → 500  "Internal server error"
```

### Protected Routes (Middleware)

```
No access token         → 401  "Unauthorized - Please login"
Access token expired    → 401  (try refresh token silently)
Access token invalid    → 401  "Unauthorized - Invalid token"
No refresh token        → 401  "Session expired - Please login again"
Refresh token invalid   → 401  "Invalid session - Please login again"
Refresh token not in DB → 401  "Invalid session - Please login again"
Token valid             → next() (no response — continues to controller)
```

---

## Common Mistakes to Avoid

```
❌ Using 200 for "user created"     → use 201
❌ Using 500 for "user not found"   → use 404 (server didn't crash)
❌ Using 401 for "no permission"    → use 403 (401 = not logged in)
❌ Using 403 for "not logged in"    → use 401 (403 = logged in, no access)
❌ Using 404 for "wrong password"   → use 400 (user EXISTS, just wrong pass)
❌ Using 200 for errors             → always use 4xx or 5xx for errors
❌ Exposing error.message in prod   → use generic message only
❌ Using 501 for server errors      → use 500 (501 = not implemented)
```

---

## Response Format Standard

Always follow this consistent format:

```javascript
// Success
res.status(200).json({
    success: true,
    message: "Human readable message",
    data: { ... }      // optional — include when returning data
})

// Error
res.status(400).json({
    success: false,
    message: "Human readable error message",
    error: error.message  // optional — only in development
})
```

> `success: true/false` — frontend checks this flag first.
> Consistent format = frontend always knows what to expect.

---

## Quick Decision Guide

```
User not logged in?              → 401
Logged in but no permission?     → 403
Resource doesn't exist?          → 404
Duplicate entry?                 → 409
Missing/invalid input?           → 400
Something created in DB?         → 201
General success?                 → 200
Delete success?                  → 200 or 204
Server crashed unexpectedly?     → 500
Rate limit exceeded?             → 429
```

---

*Keep this open whenever writing controllers. Use the right code every time.* 🎯
