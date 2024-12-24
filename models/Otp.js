const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  referenceId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document will automatically delete after 5 minutes
  },
});

module.exports = mongoose.model("Otp", otpSchema);