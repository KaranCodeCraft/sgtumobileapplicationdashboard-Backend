const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
} = require("../controllers/student.Controller");

router.get("/notifications", getNotifications);
router.post("/notification", addNotification);

module.exports = router;