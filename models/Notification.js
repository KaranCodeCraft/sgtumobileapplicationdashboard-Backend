const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
    enum: ["exam", "general", "result"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;