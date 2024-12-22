const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.Controller");

router.post("/signup", signup); 
router.post("/login", login); 

module.exports = router;