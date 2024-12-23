const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { z } = require("zod");
require("dotenv").config();

// Zod schema for signup validation
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  rollNumber: z.string().min(1, "Roll number is required"),
  department: z.string().min(1, "Department is required"),
  course: z.string().min(1, "Course is required"),
  year: z.number().min(1).max(4, "Year must be between 1 and 4"),
  semester: z.number().min(1).max(2, "Semester must be 1 or 2"),
});

// Zod schema for login validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// Student Signup
const registerStudent = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    rollNumber,
    department,
    course,
    year,
    semester,
  } = req.body;

  // Validate the request body with Zod
  try {
    signupSchema.parse({
      firstName,
      lastName,
      email,
      password,
      rollNumber,
      department,
      course,
      year,
      semester,
    });
  } catch (err) {
    return res.status(400).json({ message: err.errors[0].message });
  }


  try {
    // Check if the student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student
    const newStudent = new Student({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      rollNumber,
      department,
      course,
      year,
      semester,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Student Login
const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  // Validate the request body with Zod
  try {
    loginSchema.parse({ email, password });
  } catch (err) {
    return res.status(400).json({ message: err.errors[0].message });
  }

  try {
    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isPasswordCorrect = await bcrypt.compare(password, student.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful", name:student.firstName+" "+student.lastName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const allStudent = async (req, res) => {
  try {
    // Fetch all students from the database
    const students = await Student.find();

    // Return the list of students as a response
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    // Handle any potential errors
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

module.exports = { registerStudent, loginStudent, allStudent };
