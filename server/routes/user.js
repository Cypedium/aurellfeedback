const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.get("/", userController.getAll);
router.get("/usernames", userController.Usernames);
router.delete("/delete-all", userController.deleteAll);

// ⭐ NEW LAYOUT ROUTES
router.get("/layout", auth, userController.getLayout);
router.put("/layout", auth, userController.updateLayout);

module.exports = router;
