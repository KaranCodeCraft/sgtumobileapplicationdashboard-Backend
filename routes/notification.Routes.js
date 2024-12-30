const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
  patchNotification,
  deleteNotification,
} = require("../controllers/notification.Controller");
const { checkRole, verifyToken} = require("../middlewares/auth");

router.get("/", verifyToken, getNotifications);
router.post("/", verifyToken, checkRole("admin"), addNotification);
router.patch("/:id", verifyToken, checkRole("admin"), patchNotification);
router.delete("/:id", verifyToken, checkRole("admin"), deleteNotification);

module.exports = router;