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
    type: [String], // Array of strings, you can use tags like ['exam', 'holiday', 'announcement']
    required: true,
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
