// server/controllers/cardController.js
const Card = require("../models/Card");

exports.getAll = async (req, res) => {
  try {
    const cards = await Card.find().sort({ submittedAt: -1 });
    res.status(200).json(cards);
  } catch (error) {
    console.error("Fetch cards error:", error);
    res.status(500).json({ message: "Could not retrieve cards." });
  }
};

exports.create = async (req, res) => {
  const { rating, comment, productId, username, submittedAt } = req.body;
  try {
    const newCard = new Card({ rating, comment, productId, username, submittedAt });
    await newCard.save();
    res.status(200).json({ message: "Card saved successfully!" });
  } catch (error) {
    console.error("Save card error:", error);
    res.status(500).json({ message: "Failed to save card." });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Card.findByIdAndDelete(id);
    res.status(200).json({ message: "Card deleted successfully." });
  } catch (error) {
    console.error("Delete card error:", error);
    res.status(500).json({ message: "Could not delete card." });
  }
};
