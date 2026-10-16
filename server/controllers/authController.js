// server/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  const { username, password, pictureUrl } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, passwordHash, pictureUrl });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Error creating user." });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log("User logged in:", username);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Frontend använder localStorage → returnera tokens i body
    res.json({
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in." });
  }
};

// ---------------- LOGOUT ----------------
exports.logout = (req, res) => {
  // Stateless logout — frontend tar bort tokens
  res.status(200).json({ message: "Logged out successfully." });
};

// ---------------- REFRESH TOKEN ----------------
exports.refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err) {
      console.error("Refresh token verify error:", err);
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // decoded.id finns nu eftersom generateRefreshToken använder { id: user._id }
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  });
};

// Debug for only local use 
// controllers/authController.js
/*
exports.register = async (req, res) => {
  // validera/skapande i DB om du vill; annars stub
  const user = { id: "dev-user-id", email: req.body.email || "dev@example.com" };
  return res.json({ accessToken: "dev-access-token", user });
};

exports.login = async (req, res) => {
  // validera användare i DB om du vill; annars stub
  const user = { id: "dev-user-id", email: req.body.email || "dev@example.com" };
  return res.json({ accessToken: "dev-access-token", user });
};

exports.refresh = (req, res) => {
  // returnera dummy token utan cookie/verifiering
  return res.json({ accessToken: "dev-access-token", expiresIn: 3600 });
};

exports.logout = (req, res) => {
  // rensa cookie om den finns, men utan verifiering
  res.clearCookie && res.clearCookie("refreshToken");
  return res.json({ message: "Logged out (dev mode)" });
}; */
