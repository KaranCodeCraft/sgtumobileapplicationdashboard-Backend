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
        enum: [1, 2, 3, 4, 5, 6, 7, 8],
        required: true,
      },
      resultPdf: {
        type: String,
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
