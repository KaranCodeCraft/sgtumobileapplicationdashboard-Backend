const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { z } = require("zod");
const axios = require("axios");
require("dotenv").config();

const { SANDBOX_API_KEY, SANDBOX_API_SECRET } = process.env;



// Zod schema for signup validation
const signupSchema = z.object({
  enrollmentNumber: z.string().min(1, "Enrollment Number is required"),
  aadharNumber: z
    .number()
    .gt(100000000000, "Aadhar Number must be a 12-digit number")
    .lte(999999999999, "Aadhar Number must be a 12-digit number"),
});

// Zod schema for login validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// Student Signup
const registerStudent = async (req, res) => {
  const { enrollmentNumber, aadharNumber } = req.body;

  // Validate the request body with Zod
  try {
    signupSchema.parse({
      enrollmentNumber,
      aadharNumber,
    });
  } catch (err) {
    return res.status(400).json({ message: err.errors[0].message });
  }

  try {
    // Check if the student already exists
    const validStudent = await Student.findOne({ enrollmentNumber });
    if (!validStudent) {
      return res
        .status(400)
        .json({ message: "Enrollment number does not exist" });
    }

    // Check if the Aadhaar number matches
    if (validStudent.aadharNumber !== aadharNumber) {
      return res.status(400).json({ message: "Aadhaar number does not match" });
    }

    if (validStudent.subscriptionDetails.isActive) {
      return res
        .status(409)
        .json({ message: "Account already activated. Kindly Login" });
    }

    if (!validStudent.subscriptionDetails.isActive) {
      try {
        // Define headers for authentication request
        const authHeaders = {
          "x-api-version": "2.0",
          "x-api-secret": SANDBOX_API_SECRET,
          "x-api-key": SANDBOX_API_KEY,
        };

        // Send the POST request to authenticate and get token
        const authResponse = await axios.post(
          "https://api.sandbox.co.in/authenticate",
          null,
          { headers: authHeaders }
        );
        console.log("Authentication response received");

        const { access_token } = authResponse.data;
        
        if (!access_token) {
          return res.status(500).json({
            message: "Failed to retrieve access token. Please try again later.",
          });
        }

        // Define OTP request headers using the retrieved access token
        const otpHeaders = {
          "x-api-version": "2.0",
          "x-api-key": "key_live_A2XSNXjpuc5Gv6u5a0WRgWtZNvGjRnsq",
          Authorization: access_token,
        };

        // Body for OTP request
        const otpBody = {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
          aadhaar_number: `${aadharNumber}`,
          consent: "y",
          reason: "Student confirmation for Registration purpose - SGTU",
        };

        // Send OTP request
        const otpResponse = await axios.post(
          "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp",
          otpBody,
          { headers: otpHeaders }
        );
        console.log("OTP response received");

        // Check if OTP was sent successfully
        if (otpResponse.data && otpResponse.data.code === 200) {
          return res.status(200).json({
            message: "OTP sent successfully",
            transactionId: otpResponse.data.transaction_id,
            referenceId: otpResponse.data.data.reference_id, // Optional: Store for OTP verification
          });
        } else {
          return res.status(400).json({
            message: "Failed to send OTP. Please try again later",
          });
        }
      } catch (error) {
        console.error(
          "Error during OTP request:",
          error.response?.data || error.message
        );
        res.status(500).json({
          message: "OTP request failed",
          error: error.response?.data || error.message,
        });
      }
    }
  } catch (err) {
    console.error("Error during student registration:", err.message);
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
