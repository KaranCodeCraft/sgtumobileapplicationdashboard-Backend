const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [1, "Name is required"],
  },
  enrollmentNumber: {
    type: String,
    unique: true,
    required: [true, "Enrollment Number is required"],
    min: [1, "Enrollment Number must be greater than or equal to 1"],
  },
  aadharNumber: {
    type: Number,
    unique: true,
    required: [true, "Aadhar Number is required"],
    validate: {
      validator: (v) => v.toString().length === 12,
      message: "Aadhar Number must be a 12-digit number",
    },
  },
  mobileNumber: {
    type: Number,
    required: [true, "Mobile Number is required"],
    validate: {
      validator: (v) => v.toString().length === 10,
      message: "Mobile Number must be a 10-digit number",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
  },
  session: {
    type: Number,
    required: [true, "Session is required"],
    min: [2000, "Session must be a 4-digit number"],
  },
  course: {
    type: String,
    required: [true, "Course is required"],
    minlength: [1, "Course is required"],
  },
  stream: {
    type: String,
    required: [true, "Stream is required"],
    minlength: [1, "Stream is required"],
  },
});

module.exports = mongoose.model("Student", studentSchema);

// const mongoose = require("mongoose");

// const studentSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   enrollmentNumber: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },

//   department: {
//     type: String,
//     required: true,
//   },
//   course: {
//     type: String,
//     required: true,
//   },
//   year: {
//     type: Number,
//     required: true,
//     enum: [1, 2, 3, 4],
//   },
//   semester: {
//     type: Number,
//     required: true,
//     enum: [1, 2],
//   },
//   marksheet: [
//     {
//       subject: String,
//       marks: Number,
//       grade: String,
//     },
//   ],
//   notifications: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Notification",
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// studentSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// const Student = mongoose.model("Student", studentSchema);

// module.exports = Student;
