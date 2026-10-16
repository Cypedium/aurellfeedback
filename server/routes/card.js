// routes/card.js
const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

// Note: The order of routes matters. More specific routes should be defined before less specific ones.
// Define routes for card operations -
// Note: When you define app.use("/api/card", cardRoutes); 
// in your main server file, all routes defined in this router will 
// be prefixed with /api/card. So, the GET route defined here will
//  actually be accessible at /api/card/ and the 
// POST|GET route at /api/card/, and the DELETE route at /api/card/:id.
router.get("/", cardController.getAll);
router.post("/", cardController.create);
router.delete("/:id", cardController.remove);

module.exports = router;