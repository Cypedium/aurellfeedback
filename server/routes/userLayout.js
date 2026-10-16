const express = require("express");
const router = express.Router();
const { getLayout, updateLayout } = require("../controllers/userLayoutController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/layout", authMiddleware, getLayout);
router.put("/layout", authMiddleware, updateLayout);

module.exports = router;
