const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { z } = require("zod");
const axios = require("axios");
require("dotenv").config();
const Otp = require("../models/Otp");

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
  enrollmentNumber: z.string().min(1, "Enrollment Number is required"),
  aadharNumber: z
    .number()
    .gt(100000000000, "Aadhar Number must be a 12-digit number")
    .lte(999999999999, "Aadhar Number must be a 12-digit number"),
});

// Student Signup
const registerStudent = async (req, res) => {
  const { enrollmentNumber, aadharNumber } = req.body;

  // Validate the request body with Zod
  try {
    signupSchema.parse({ enrollmentNumber, aadharNumber });
  } catch (err) {
    return res.status(400).json({ message: err.errors[0].message });
  }

  try {
    // Check if the student exists
    const validStudent = await Student.findOne({ enrollmentNumber });
    if (!validStudent) {
      return res
        .status(400)
        .json({ message: "Enrollment number does not exist" });
    }

    // Validate Aadhaar number
    if (validStudent.aadharNumber !== aadharNumber) {
      return res.status(400).json({ message: "Aadhaar number does not match" });
    }

    // Check subscription status
    if (validStudent.subscriptionDetails.isActive) {
      return res
        .status(409)
        .json({ message: "Account already activated. Kindly Login" });
    }

    // Check for existing OTP requests
    const existingOtp = await Otp.findOne({ enrollmentNumber });
    if (existingOtp) {
      const timeElapsed = new Date() - new Date(existingOtp.createdAt);
      if (timeElapsed < 300000) {
        // 5 minutes
        return res.status(400).json({
          success: false,
          message: "Please wait before requesting another OTP.",
        });
      } else {
        // Remove expired OTP entry
        await Otp.deleteOne({ enrollmentNumber });
      }
    }

    // Authenticate with API to get access token
    const authHeaders = {
      "x-api-version": "2.0",
      "x-api-secret": SANDBOX_API_SECRET,
      "x-api-key": SANDBOX_API_KEY,
    };

    const authResponse = await axios.post(
      "https://api.sandbox.co.in/authenticate",
      null,
      { headers: authHeaders }
    );

    const { access_token } = authResponse.data;
    if (!access_token) {
      return res.status(500).json({
        message: "Failed to retrieve access token. Please try again later.",
      });
    }

    // Send OTP request
    const otpHeaders = {
      "x-api-version": "2.0",
      "x-api-key": SANDBOX_API_KEY,
      Authorization: access_token,
    };

    const otpBody = {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: `${aadharNumber}`,
      consent: "y",
      reason: "Student confirmation for Registration purpose - SGTU",
    };

    const otpResponse = await axios.post(
      "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp",
      otpBody,
      { headers: otpHeaders }
    );

    if (otpResponse.data && otpResponse.data.code === 200) {
      const referenceId = otpResponse.data.data.reference_id;

      // Save OTP details in the database
      const otp = new Otp({
        enrollmentNumber,
        referenceId,
      });

      await otp.save();
      return res.status(200).json({
        message: "OTP sent successfully",
        referenceId,
      });
    } else {
      return res.status(400).json({
        message: "Failed to send OTP. Please try again later.",
      });
    }
  } catch (error) {
    console.error(
      "Error during student registration:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "An error occurred. Please try again later.",
      error: error.response?.data || error.message,
    });
  }
};

// Verfiy OTP
const verifyOtp = async (req, res) => {
  try {
    const { reference_id, otp } = req.body;

    // Check if the reference ID exists in the database
    const checkRef = await Otp.findOne({ referenceId: reference_id });
    if (!checkRef) {
      return res.status(400).json({
        message: "Kindly generate registration again.",
      });
    }
    const { enrollmentNumber } = checkRef;

    // Send OTP for verification to Sandbox API
    const authHeaders = {
      "x-api-version": "2.0",
      "x-api-secret": SANDBOX_API_SECRET,
      "x-api-key": SANDBOX_API_KEY,
    };

    // Authenticate to get the access token
    const authResponse = await axios.post(
      "https://api.sandbox.co.in/authenticate",
      null,
      { headers: authHeaders }
    );

    const { access_token } = authResponse.data;
    if (!access_token) {
      return res.status(500).json({
        message: "Failed to retrieve access token. Please try again later.",
      });
    }

    // Verify OTP
    const verifyHeaders = {
      "x-api-version": "2.0",
      "x-api-key": SANDBOX_API_KEY,
      "Authorization": access_token,
    };

    const verifyBody = {
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
      reference_id,
      otp,
    };
    console.log("check 1");
    
    const verifyResponse = await axios.post(
      "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify",
      verifyBody,
      { headers: verifyHeaders }
    );

    if (verifyResponse.data && verifyResponse.data.code === 200) {
      // OTP verified successfully
      console.log(checkRef.enrollmentNumber);
      
      // Find the student in the database using the enrollment number from OTP
      const student = await Student.findOne({
        enrollmentNumber: checkRef.enrollmentNumber,
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }

      // Calculate the expiry date (one year from the current date)
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(currentDate.getFullYear() + 1);

       const updatedStudent = await Student.findOneAndUpdate(
         { enrollmentNumber }, // Filter by enrollment number
         {
           // Fields to update
           "appRegisDetails.date": currentDate,
           "appRegisDetails.status": true,
           "subscriptionDetails.isActive": true,
           "subscriptionDetails.expiryDate": expiryDate,
         },
         { new: true } // Return the updated document
       );

      if (!updatedStudent) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Student details updated successfully. Now you can Login",
      });
    } else {
      // OTP verification failed
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error(
      "Error verifying OTP:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "An error occurred while verifying OTP.",
      error: error.response?.data || error.message,
    });
  }
};


// Student Login
const loginStudent = async (req, res) => {
  const { enrollmentNumber, aadharNumber } = req.body;

  if (!enrollmentNumber || !aadharNumber) {
    return res
      .status(400)
      .json({ message: "Enrollment number and Aadhaar number are required." });
  }

  // Validate the request body with Zod
   try {
     loginSchema.parse({ enrollmentNumber, aadharNumber });
   } catch (err) {
     return res.status(400).json({ message: err.errors[0].message });
   }

  try {
    // Find student by enrollment number and Aadhaar number
    const student = await Student.findOne({
      enrollmentNumber,
      aadharNumber,
    });

    if (!student) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // Check if student registration is active
    if (student.appRegisDetails.status) {
      // Generate a JWT token valid for 1 hour
      const token = jwt.sign(
        {
          id: student._id, // Store student ID in JWT for secure identification
          name: student.name, // Concatenate first and last name
          enrollmentNumber: student.enrollmentNumber, // Add enrollment number for identification
        },
        process.env.JWT_SECRET, // Secret key for encoding the token
        { expiresIn: "6h" } // Token expiry time (1 hour)
      );

      // Respond with the token and a success message
      return res.status(200).json({
        token,
        message: "Login successful",
        name: `${student.name}`, // Full name
      });
    } else {
      return res
        .status(403)
        .json({ message: "Kindly register your account first." });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Internal server error" });
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

module.exports = { registerStudent, loginStudent, allStudent, verifyOtp };