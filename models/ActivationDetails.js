const mongoose = require("mongoose");

const activationDetailsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true, 
  },
  registrationDetails: {
    date: { type: Date, default: Date.now },
    status: { type: Boolean, default: false }, 
  },
  subscriptionDetails: {
    isActive: { type: Boolean, default: false }, 
    expiryDate: { type: Date, default: null }, 
  },
});

module.exports = mongoose.model("ActivationDetails", activationDetailsSchema);