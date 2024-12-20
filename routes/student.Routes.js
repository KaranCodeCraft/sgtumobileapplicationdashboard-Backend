const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
} = require("../controllers/student.Controller");

router.post("/register", registerStudent);
router.post("/login", loginStudent);

module.exports = router;