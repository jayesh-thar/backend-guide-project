import express from "express";
import { register, login } from '../controllers/auth.controller.js'

const router = express.Router();


/* # Status Code:
        200 - Success
        201 - Created successfully
        400 - Bad request (user error)
        401 - Unauthorized (not logged in)
        404 - Not found
        500 - Server error
*/


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can hit this route)
router.post("/register", register); 
// userRegister() runs immediately when server starts — before any request even comes in. That's wrong. Route needs a reference to the function — not the result of calling it. You're saying — "when someone hits /register, THEN run this function" Not — "run this function right now while setting up routes"

router.post("/login", login)



export default router;
