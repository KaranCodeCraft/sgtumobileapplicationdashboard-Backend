const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
} = require("../controllers/notification.Controller");
const { checkRole } = require("../middlewares/auth");

router.get("/notifications",getNotifications);
router.post("/notification",checkRole("admin"), addNotification);

module.exports = router;