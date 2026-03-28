import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Schema is a class, needs new keyword // Schema is a class (a blueprint) — whenever you create something from a class you need new. Like new Date() for example.
    username: {
      type: String,
      required: [true, "Username needed."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"], //regex - email validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },  
  { timestamps: true },
); //vFor createdAt and updatedAt to work automatically

const User = mongoose.model("User", userSchema);

export default User;
