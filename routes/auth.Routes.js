const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.Controller");
const { verifyToken, checkRole } = require("../middlewares/auth");


router.post("/signup", verifyToken, checkRole("admin"), signup); 
router.post("/login", login); 

module.exports = router;