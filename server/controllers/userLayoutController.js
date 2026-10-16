// server/controllers/userController.js
const User = require("../models/User");

// GET ALL USERS (public or admin)
exports.getAll = async (req, res) => {
  try {
    const users = await User.find({}, "username pictureUrl");
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Could not retrieve users." });
  }
};

// GET USERNAMES ONLY
exports.Usernames = async (req, res) => {
  try {
    const users = await User.find({}, "username");
    const usernames = users.map(user => user.username);
    res.status(200).json(usernames);
  } catch (error) {
    console.error("Fetch usernames error:", error);
    res.status(500).json({ message: "Could not retrieve usernames." });
  }
};

// DELETE ALL USERS (admin only)
exports.deleteAll = async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: "All users deleted." });
  } catch (error) {
    console.error("Delete all users error:", error);
    res.status(500).json({ message: "Failed to delete users." });
  }
};

// ⭐ NEW: GET USER LAYOUT
exports.getLayout = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return stored layout or default
    return res.status(200).json(user.layout || {
      cols: 12,
      headers: [],
      cards: []
    });

  } catch (error) {
    console.error("Get layout error:", error);
    res.status(500).json({ message: "Could not retrieve layout." });
  }
};

// ⭐ NEW: UPDATE USER LAYOUT
exports.updateLayout = async (req, res) => {
  try {
    const id = req.user.id;
    const { cols, headers, cards } = req.body;

    const user = await User.findById(id);

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
    console.error("Update layout error:", error);
    res.status(500).json({ message: "Failed to update layout." });
  }
};