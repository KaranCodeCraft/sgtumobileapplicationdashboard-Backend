const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  allStudent,
  verifyOtp,
} = require("../controllers/student.Controller");
const { verifyToken, checkRole } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const {
  documentupload,
  documentview,
} = require("../controllers/document.Controller");


router.post("/register", registerStudent);
router.post("/verifyOtp", verifyOtp);
router.post("/login", loginStudent);
router.get("/all",verifyToken,checkRole("admin"), allStudent);
router.post(
  "/document-upload",
  verifyToken,
  upload.single("file"),
  documentupload
);
router.get(
  "/document-download",
  verifyToken,
  upload.single("file"),
  documentview
);

module.exports = router;