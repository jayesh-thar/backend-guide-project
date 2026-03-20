import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // return payload which we store - 'userId' 
    req.userId = decoded.userID
    next();
  } catch (error) {
    return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token"
    })
  }
};


export default verifyToken