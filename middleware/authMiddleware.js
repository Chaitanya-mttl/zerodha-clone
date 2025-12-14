// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Your login signs: jwt.sign({ id: user._id }, ...)
    // So decoded.id exists. Normalize to req.user.id.
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
