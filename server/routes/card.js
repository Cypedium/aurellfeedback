// routes/card.js
const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const auth = require("../middleware/authMiddleware");

// Mounted at /card in app.js
router.get("/", auth, cardController.getAll);
router.post("/", auth, cardController.create);
router.delete("/:id", auth, cardController.remove);

module.exports = router;
