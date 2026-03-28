import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

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

    sendEmail({
      to: user.email,
      subject: "Welcome to MyApp! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          
          <div style="background-color: #4F46E5; padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome Aboard! 🎉</h1>
              <p style="color: #c7d2fe; margin-top: 10px;">We're glad to have you with us</p>
          </div>

          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333;">Hey ${user.username}, 👋</h2>
              <p style="color: #666; line-height: 1.8;">
                  Your account has been successfully created. 
                  You can now login and explore everything we have to offer.
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #555;"><strong>Account Details:</strong></p>
                  <p style="margin: 5px 0; color: #666;">📧 Email: ${user.email}</p>
                  <p style="margin: 5px 0; color: #666;">👤 Username: ${user.username}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                  <a href="#" 
                    style="background-color: #4F46E5; color: white; padding: 14px 40px; 
                            border-radius: 6px; text-decoration: none; font-size: 16px;
                            font-weight: bold;">
                      Get Started →
                  </a>
              </div>

              <p style="color: #999; font-size: 13px; line-height: 1.6;">
                  If you didn't create this account, please ignore this email or 
                  contact support immediately.
              </p>
          </div>

          <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">
              © 2024 MyApp. All rights reserved.
          </p>

        </div>
      `,
    });

    await generateToken(user._id, res);

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
      await generateToken(userExisted._id, res);
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "logout failed - no token - please login first",
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "logout failed - no login user exist - login with valid credentials.",
      });
    }

    user.refreshToken = undefined;
    await user.save();

    res.cookie("accessToken", "", { maxAge: 0 });
    res.cookie("refreshToken", "", { maxAge: 0 });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with emailId: ${email} NOT FOUND.`,
      });
    }
    user.lastLogin = Date.now();
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // '1hr' from next sec
    await user.save();
    sendEmail({
      to: user.email,
      subject: "Reset Password request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="http://localhost:5000/api/auth/reset-password/${resetToken}">
            Reset Password
        </a>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    return res.status(200).json({
      success: true,
      message: `Successfully sent Reset password to ${user.username}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error.",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    // const { token } = req.params; // also correct
    const token = req.params.token;

    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter new password",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "token invalid or expired",
      });
    }
    const newResetPassword = await bcryptjs.hash(newPassword, 10);
    user.password = newResetPassword;
    user.resetPasswordToken = undefined; // ✅ clear token
    user.resetPasswordExpiresAt = undefined; // ✅ clear expiry
    await user.save();
    sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    
    <div style="background-color: #16a34a; padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Successful ✅</h1>
        <p style="color: #bbf7d0; margin-top: 10px;">Your password has been updated</p>
    </div>

    <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Hey ${user.username}, 👋</h2>
        <p style="color: #666; line-height: 1.8;">
            Your password has been successfully reset. 
            You can now login with your new password.
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #555;">🕐 Reset Time: ${new Date().toLocaleString()}</p>
        </div>

        <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #9a3412;">
                ⚠️ If you didn't reset your password, please contact support immediately.
                Your account may be compromised.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/login" 
               style="background-color: #16a34a; color: white; padding: 14px 40px; 
                      border-radius: 6px; text-decoration: none; font-size: 16px;
                      font-weight: bold;">
                Login Now →
            </a>
        </div>

        <p style="color: #999; font-size: 13px; line-height: 1.6; text-align: center;">
            If you have any questions, contact our support team.
        </p>
    </div>

    <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">
        © 2024 MyApp. All rights reserved.
    </p>

</div>
      `,
    });
    return res.status(200).json({
      success: true,
      message: "Successfully reset password",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error.",
      error: error.message,
    });
  }
};

export { register, login, logout, forgotPassword, resetPassword };
