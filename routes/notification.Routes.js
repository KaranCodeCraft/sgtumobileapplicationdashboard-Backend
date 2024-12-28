const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
} = require("../controllers/notification.Controller");
const { checkRole } = require("../middlewares/auth");

router.get("/all",getNotifications);
router.post("/add",checkRole("admin"), addNotification);

module.exports = router;