const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true,
  },
  semesters: [
    {
      semesterNumber: {
        type: Number,
        required: true,
      },
      resultPdf: {
        type: Buffer, // Use Buffer to store binary data
        required: true,
      },
      status: {
        type: String,
        enum: ["Pass", "Fail"],
        required: true,
      },
    },
  ],
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;