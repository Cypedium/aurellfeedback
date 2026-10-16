// server/controllers/userController.js
const User = require("../models/User");

const MIN_COLS = 1;
const MAX_COLS = 12;

// GET ALL USERS
exports.getAll = async (req, res) => {
  try {
    const users = await User.find({}, "username pictureUrl").lean();
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error.message);
    res.status(500).json({ message: "Could not retrieve users." });
  }
};

// GET USERNAMES ONLY
exports.Usernames = async (req, res) => {
  try {
    const users = await User.find({}, "username").lean();
    const usernames = users.map(user => user.username);
    res.status(200).json(usernames);
  } catch (error) {
    console.error("Fetch usernames error:", error.message);
    res.status(500).json({ message: "Could not retrieve usernames." });
  }
};

// ⭐ GET USER LAYOUT
exports.getLayout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "layout").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user.layout);
  } catch (error) {
    console.error("Get layout error:", error.message);
    res.status(500).json({ message: "Could not retrieve layout." });
  }
};

// ⭐ UPDATE USER LAYOUT
exports.updateLayout = async (req, res) => {
  const { cols, headers, cards } = req.body;

  if (cols !== undefined && (!Number.isInteger(cols) || cols < MIN_COLS || cols > MAX_COLS)) {
    return res.status(400).json({ message: `cols must be an integer between ${MIN_COLS} and ${MAX_COLS}.` });
  }
  if ((headers !== undefined && !Array.isArray(headers)) || (cards !== undefined && !Array.isArray(cards))) {
    return res.status(400).json({ message: "headers and cards must be arrays." });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.layout = {
      cols: cols ?? user.layout.cols,
      headers: headers ?? user.layout.headers,
      cards: cards ?? user.layout.cards
    };

    await user.save();

    res.status(200).json({ message: "Layout updated successfully." });
  } catch (error) {
    console.error("Update layout error:", error.message);
    res.status(500).json({ message: "Failed to update layout." });
  }
};
