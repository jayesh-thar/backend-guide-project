# MongoDB Atlas + Compass + Node.js Setup Guide

This document explains the complete workflow for:

- Creating a MongoDB Atlas database
- Creating a cluster
- Connecting with MongoDB Compass
- Connecting Node.js backend using Mongoose
- Network configuration
- Debugging common errors

This acts as a personal reference guide.

---

# 1. Create MongoDB Atlas Account

Go to:

https://www.mongodb.com/atlas

Steps:

1. Click **Try Free**
2. Sign up using:
   - Google
   - GitHub
   - Email

After login you enter the **MongoDB Atlas dashboard**.

---

# 2. Create Project

Projects organize clusters.

Steps:

1. Click **New Project**
2. Name example:

```

backend-project

```
3. Click **Create Project**

---

# 3. Create Cluster

Inside the project:

1. Click **Build a Database**
2. Choose **FREE M0 Cluster**

Recommended configuration:

```

Cloud Provider : AWS
Region         : nearest region (Mumbai / Singapore)
Cluster Name   : Cluster0

```

Click:

```

Create Deployment

```

Cluster creation takes **1–2 minutes**.

---

# 4. Create Database User

Atlas requires authentication.

Go to:

```

Security → Database Access

```

Click **Add New Database User**

Example:

```

Username : jayesh
Password : strongpassword
Role     : Atlas Admin

```

Click **Create User**

---

# 5. Configure Network Access

Atlas blocks unknown IP addresses.

Go to:

```

Security → Network Access

```

Add your IP.

For development use:

```

0.0.0.0/0

```

Meaning:

```

Allow access from any IP

```

---

# 6. Get Connection String

Go to:

```

Clusters → Connect

```

Select:

```

Connect your application

```

Driver:

```

Node.js

```

Example connection string:

```

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

```

Add database name:

```

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/authDB

```

---

# 7. Setup Environment Variables

Create `.env`

```

PORT=5000
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/authDB

```

Important rules:

```

No spaces around "="

Correct:

MONGO_URL=value

Wrong:

MONGO_URL = value

```

---

# 8. Install Dependencies

```

npm install mongoose dotenv

````

---

# 9. Database Connection Code

`src/config/db.js`

```javascript
import mongoose from "mongoose";

async function connectDB() {
try {
await mongoose.connect(process.env.MONGO_URL);

````

console.log("MongoDB Connected");
} catch (error) {
console.error("DB connection failed", error);
process.exit(1);
}

```

}

export default connectDB;
```

---

# 10. Express App

`src/app.js`

```javascript
import express from "express";

const app = express();

app.get("/", (req, res) => {
res.send("API running");
});

export default app;
```

---

# 11. Server Entry File

`server.js`

```javascript
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();

const port = process.env.PORT || 5000;

app.listen(port, () => {
console.log(`Server running on port: ${port}`);
});
```

---

# 12. Run Server

```

npm run dev

```

Expected output:

```

Server running on port: 5000
MongoDB Connected

```

---

# 13. Connect MongoDB Compass

Download:

[https://www.mongodb.com/products/tools/compass](https://www.mongodb.com/products/tools/compass)

Open Compass.

Paste connection string:

```

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net

```

Click **Connect**

Compass will show:

```

Cluster
Database
Collections

```

---

# 14. Database Creation

MongoDB automatically creates databases when data is inserted.

Example:

```

db.users.insertOne({ name: "Jayesh" })

```

Result:

```

authDB
└── users collection

```

---

# 15. Common Networking Problems

MongoDB Atlas uses **DNS SRV records**.

Connection string:

```

mongodb+srv://

```

internally resolves:

```

_mongodb._tcp.cluster.mongodb.net

```

If DNS cannot resolve SRV records you get errors.

---

# 16. Common Error: querySrv ECONNREFUSED

Example error:

```

querySrv ECONNREFUSED \_mongodb.\_tcp.cluster.mongodb.net

```

Meaning:

```

DNS server cannot resolve SRV records

```

Possible causes:

```

Campus / hostel WiFi DNS filtering
ISP DNS issue
Router DNS cache failure
VPN DNS interference

```

Solutions:

```

1. Change DNS to Google DNS

8.8.8.8
8.8.4.4

2. Use Cloudflare DNS

1.1.1.1

3. Connect using phone hotspot

4. Flush DNS cache

ipconfig /flushdns

```

---

# 17. Check DNS Configuration

Run:

```

ipconfig /all

```

Check:

```

DNS Servers

```

Example:

```

DNS Servers : 8.8.8.8
8.8.4.4

```

---

# 18. Test DNS Resolution

```

nslookup cluster0.mongodb.net

```

Working output returns MongoDB hosts.

---

# 19. Network Reset Commands

```

ipconfig /release
ipconfig /renew
ipconfig /flushdns

```

---

# 20. Atlas Security Notes

Never commit `.env` to GitHub.

Add to `.gitignore`:

```

node_modules
.env

```

---

# 21. Typical Backend Folder Structure

```

backend
│
├── src
│ ├── config
│ │ └── db.js
│ ├── models
│ ├── routes
│ ├── controllers
│ └── middleware
│
├── server.js
├── package.json
├── .env
└── .gitignore

```

---

# 22. Development Workflow

```

Create Atlas cluster
Add database user
Allow network access
Get connection string
Store in .env
Connect using mongoose
Start server

```

---

# 23. Expected Working Flow

```

Node Server
↓
Mongoose
↓
MongoDB Atlas Cluster
↓
Database
↓
Collections

```

---

# 24. Security Reminder

Never expose:

```

MongoDB password
.env file
private API keys

```

Always use:

```

.env
.gitignore

```

---

# End of Notes

This document can be used as a quick reference for setting up MongoDB Atlas with Node.js backend.

```

---

If you want, I can also create a **much better "Backend Setup Handbook" for your repo** that includes:

- MongoDB Atlas  
- Express project architecture  
- authentication backend setup  
- JWT login system  
- environment management  
- deployment notes  

so your backend project becomes **fully documented like a professional repo**.
```
