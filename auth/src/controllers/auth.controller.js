import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  // get data
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Some field's are missing, please enter",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password length at-least 6 Character.",
      });
    }

    // check 'User' existent
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        // Without return — even after sending error response, the function keeps running below. In production this causes "headers already sent" error because you tried to send two responses.
        success: false,
        message: "User Already exists.",
      });
    }

    // hashing password
    const hashedPassword = await bcryptjs.hash(password, 10);

    //create user in DB
    //   const user = new User({ username, email, password: hashedPassword });
    //   await user.save();
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    }); // more cleaner

    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "User Successfully create",
      userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
  // catch - findOne(if DB not connected) || User.create(if DB connection drops mid-request) || Schema validation fails(if 'required fields' not full-fill)
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email or password field missing.",
      });
    }

    const userExisted = await User.findOne({ email });
    if (!userExisted) {
      return res.status(400).json({
        success: false,
        message: "User not exists, register and login again.",
      });
    }
    const correctPassword = await bcryptjs.compare(
      password,
      userExisted.password,
    );
    if (correctPassword) {
      return res.status(200).json({
        success: true,
        message: `${userExisted.username} login successfully.`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect, please enter correct password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

export { register, login };
