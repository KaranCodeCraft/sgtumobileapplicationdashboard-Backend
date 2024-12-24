const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    minlength: [1, "Name is required"],
  },
  enrollmentNumber: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Enrollment Number is required"],
    min: [1, "Enrollment Number must be greater than or equal to 1"],
  },
  aadharNumber: {
    type: Number,
    unique: true,
    trim: true,
    required: [true, "Aadhar Number is required"],
    validate: {
      validator: (v) => v.toString().length === 12,
      message: "Aadhar Number must be a 12-digit number",
    },
  },
  mobileNumber: {
    type: Number,
    trim: true,
    required: [true, "Mobile Number is required"],
    validate: {
      validator: (v) => v.toString().length === 10,
      message: "Mobile Number must be a 10-digit number",
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Email is required"],
    match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
  },
  session: {
    type: Number,
    trim: true,
    required: [true, "Session is required"],
    min: [2000, "Session must be a 4-digit number"],
  },
  course: {
    type: String,
    trim: true,
    required: [true, "Course is required"],
    minlength: [1, "Course is required"],
  },
  stream: {
    type: String,
    trim: true,
    required: [true, "Stream is required"],
    minlength: [1, "Stream is required"],
  },
  appRegisDetails: {
    date: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  subscriptionDetails: {
    isActive: {
      type: Boolean,
      default: false, // Default is 'false'
    },
    expiryDate: {
      type: Date,
      default: null, // Default to null (no expiry date initially)
    },
  },
});

module.exports = mongoose.model("Student", studentSchema);