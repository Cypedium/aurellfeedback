// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // 401 (not 403) so the frontend interceptor triggers a token refresh
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = { id: decoded.id, username: decoded.username };

    next();
  });
};
