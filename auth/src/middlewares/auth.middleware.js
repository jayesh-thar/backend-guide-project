import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access - Please Login",
      });
    }
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // if verify fail -> 'catch' will call
    req.userId = decoded.userID; // so 'next()' call and in controller 'req.userId' can have user ID as we get from accessToken
    next();
  } catch (error) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access - Please Login",
        });
      }
      
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid session - Please login again",
        });
      }
      const accessToken = jwt.sign(
        { userID: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 15,
      });
      req.userId = user._id;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Session expired - Please login again",
      });
    }
  }

  // try {
  //   const token = req.cookies.token;
  //   if (!token) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "Unauthorized - No token",
  //     });
  //   }
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET); // return payload which we store - 'userId'
  //   req.userId = decoded.userID
  //   next();
  // } catch (error) {
  //   return res.status(401).json({
  //       success: false,
  //       message: "Unauthorized - Invalid token"
  //   })
  // }
};

export default verifyToken;
