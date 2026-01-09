const express = require("express");
const router = express.Router();

// Dummy controllers for now
const { registerUser, loginUser } = require("../controllers/auth.controller");

// Define routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ This is critical
module.exports = router;
