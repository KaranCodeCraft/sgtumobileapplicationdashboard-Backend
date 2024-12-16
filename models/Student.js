const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4], 
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2], 
  },
  marksheet: [
    {
      subject: String,
      marks: Number,
      grade: String,
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;