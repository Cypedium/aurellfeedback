// server/controllers/cardController.js
const Card = require("../models/Card");
const { isNonEmptyString, isObjectId, isValidDate } = require("../utils/validate");

const COMMENT_MAX_LENGTH = 2000;
const PRODUCT_ID_MAX_LENGTH = 200;

exports.getAll = async (req, res) => {
  try {
    const cards = await Card.find().sort({ submittedAt: -1 }).lean();
    res.status(200).json(cards);
  } catch (error) {
    console.error("Fetch cards error:", error.message);
    res.status(500).json({ message: "Could not retrieve cards." });
  }
};

exports.create = async (req, res) => {
  const { rating, comment, productId, submittedAt } = req.body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
  }
  if (!isNonEmptyString(comment, COMMENT_MAX_LENGTH)) {
    return res.status(400).json({ message: `Summary is required (max ${COMMENT_MAX_LENGTH} characters).` });
  }
  if (!isNonEmptyString(productId, PRODUCT_ID_MAX_LENGTH)) {
    return res.status(400).json({ message: `Issue key is required (max ${PRODUCT_ID_MAX_LENGTH} characters).` });
  }
  if (submittedAt !== undefined && !isValidDate(submittedAt)) {
    return res.status(400).json({ message: "Invalid date." });
  }

  try {
    // Author always comes from the verified token, never from the request body
    const newCard = new Card({ rating, comment, productId, username: req.user.username, submittedAt });
    await newCard.save();
    res.status(201).json({ message: "Card saved successfully!" });
  } catch (error) {
    console.error("Save card error:", error.message);
    res.status(500).json({ message: "Failed to save card." });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid card id." });
  }

  try {
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }
    if (card.username !== req.user.username) {
      return res.status(403).json({ message: "You can only delete your own card." });
    }

    await Card.deleteOne({ _id: id });
    res.status(200).json({ message: "Card deleted successfully." });
  } catch (error) {
    console.error("Delete card error:", error.message);
    res.status(500).json({ message: "Could not delete card." });
  }
};
