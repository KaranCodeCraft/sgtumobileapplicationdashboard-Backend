const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const Student = require("../models/Student");

// Define the schema for validating students
const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  enrollmentNumber: z.string().min(1, "Enrollment Number is required"),
  aadharNumber: z.number().gt(100000000000, "Aadhar Number must be a 12-digit number, Lesser").lte(999999999999, "Aadhar Number must be a 12-digit number, Greater"),
  mobileNumber: z.number().gt(5999999999, "Mobile Number must be a 10-digit number").lte(9999999999, "Mobile Number must be a 10-digit number"),
  email: z.string().email("Invalid email address"),
  session: z.number().gte(2022, "Session must be a 4-digit number").lt(2027, "Session must be a 4-digit number"),
  course: z.string().min(1, "Course is required"),
  stream: z.string().min(1, "Stream is required"),
});



const saveStudentsToDatabase = async (students) => {
  try {
    // Attempt to insert students
    const result = await Student.insertMany(students, { ordered: false });
    console.log("Successfully inserted documents:", result);
    return { success: true, inserted: result, failed: [] };
  } catch (error) {
    console.error("Error saving students:", error);

    // Handle write errors from MongoDB
    const failedDocs =
      error.writeErrors?.map((writeError) => ({
        student: writeError.err.op, // The failed student document
        errorMessage: writeError.errmsg, // MongoDB error message
      })) || [];

    // Find inserted students
    const insertedDocs = students.filter(
      (student) =>
        !failedDocs.some(
          (failed) =>
            failed.student.enrollmentNumber === student.enrollmentNumber
        )
    );

    return { success: false, inserted: insertedDocs, failed: failedDocs };
  }
};

// Handle bulk student upload
const bulkStudenthandle = async (req, res) => {
  try {
    const { file } = req;

    // Check if a file is provided
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse the uploaded file
    const filePath = path.resolve(file.path);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const studentsData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Check if file contains data
    if (!studentsData || studentsData.length === 0) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "Excel file is empty or invalid" });
    }

    const validStudents = [];
    const invalidStudents = [];

    // Validate each student against the schema
    studentsData.forEach((student) => {
      try {
        const validatedStudent = studentSchema.parse(student);
        validStudents.push(validatedStudent);
      } catch (error) {
        invalidStudents.push({
          student,
          errors: error.errors.map((err) => err.message),
        });
      }
    });

    // Remove the uploaded file after processing
    fs.unlinkSync(filePath);

    // Return if there are invalid students
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        message: "Some students have invalid data",
        invalidStudents,
      });
    }

    // Save valid students to the database
    const isSaved = await saveStudentsToDatabase(validStudents);
    const { inserted, failed, success } = isSaved;

    if (success) {
      return res.status(200).json({
        message: "Students uploaded successfully",
        students: inserted,
        errors: failed,
      });
    }

    // Handle failure to save any students
    return res.status(207).json({
      message: "Students upload Partially",
      students: inserted,
      errors: failed,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during bulk upload", error });
  }
};

module.exports = { bulkStudenthandle };