const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  allStudent,
  verifyOtp,
} = require("../controllers/student.Controller");
const { verifyToken, checkRole } = require("../middlewares/auth");

router.post("/register", registerStudent);
router.post("/verifyOtp", verifyOtp);
router.post("/login", loginStudent);
router.get("/all",verifyToken,checkRole("admin"), allStudent);

module.exports = router;