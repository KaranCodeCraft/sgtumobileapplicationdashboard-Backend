const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
} = require("../controllers/notification.Controller");
const { verifyToken, checkRole } = require("../middlewares/auth");

router.get("/notifications",verifyToken, getNotifications);
router.post("/notification",verifyToken,checkRole("admin"), addNotification);

module.exports = router;