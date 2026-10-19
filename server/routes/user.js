const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, userController.getAll);
router.get("/usernames", auth, userController.Usernames);

router.get("/layout", auth, userController.getLayout);
router.put("/layout", auth, userController.updateLayout);

module.exports = router;
