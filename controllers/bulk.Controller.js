const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const Student = require("../models/Student");

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  enrollmentNumber: z.number().gte(1, "Enrollment Number is required"),
  aadharNumber: z.number().gte(100000000000, "Aadhar Number must be a 12-digit number"),
  mobileNumber: z.number().gte(1000000000, "Mobile Number must be a 10-digit number"),
  email: z.string().email("Invalid email address"),
  session: z.number().gte(2000, "Session must be a 4-digit number"),
  course: z.string().min(1, "Course is required"),
  stream: z.string().min(1, "Stream is required"),
});

const saveStudentsToDatabase = async (students) => {
  try {
    const result = await Student.insertMany(students, { ordered: false });
    console.log("Successfully inserted documents:", result);
    return { success: true, inserted: result, failed: [] };
  } catch (error) {
    const insertedDocs = error.insertedDocs || [];
    const failedDocs = students.filter(
      (student) =>
        !insertedDocs.some(
          (doc) => doc.enrollmentNumber === student.enrollmentNumber
        )
    );
    console.error("Error saving students:", error);
    return { success: false, inserted: insertedDocs, failed: failedDocs };
  }
};


const bulkStudenthandle = async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    const filePath = path.resolve(file.path); 
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; 
    const studentsData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
   
    if (!studentsData || studentsData.length === 0) {
      fs.unlinkSync(filePath); 
      return res
        .status(400)
        .json({ message: "Excel file is empty or invalid" });
    }


    const validStudents = [];
    const invalidStudents = [];

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
    fs.unlinkSync(filePath);

    if (invalidStudents.length > 0) {
      return res.status(400).json({
        message: "Some students have invalid data",
        invalidStudents,
      });
    }

    // Save valid students to the database
    const isSaved = await saveStudentsToDatabase(validStudents);

    if (isSaved) {
      return res.status(200).json({
        message: "Students uploaded successfully",
        students: validStudents,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to save students to the database" });
    }
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during bulk upload", error });
  }
};

module.exports = { bulkStudenthandle };
