const fs = require("fs");
const path = require("path");
const Result = require("../models/Result");
const {z} = require("zod");

// Upload and save PDF in MongoDB
const addStudentResult = async (req, res) => {
  try {
    const { studentId, semesterNumber, status } = req.body;

    // Validate if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required.",
      });
    }

    // Check if the result already exists
    const existingResult = await Result.findOne({
      student: studentId,
      "semesters.semesterNumber": semesterNumber,
    });

    if (existingResult) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Result already published for this semester.",
      });
    }
    
    // Check for dir and create if not exists
    const resultFolder = path.join(__dirname, "../result");
    if (!fs.existsSync(resultFolder)) {
      fs.mkdirSync(resultFolder);
    }
    
    // Move the file to the result folder
    const newFilePath = path.join(
      resultFolder,
      `${studentId}_semester${semesterNumber}.pdf`
    );


    const tempFilePath = req.file.path;
     
     fs.renameSync(tempFilePath, newFilePath);


    const result = await Result.findOneAndUpdate(
      { student: studentId },
      {
        $push: {
          semesters: {
            semesterNumber,
            resultPdf: newFilePath, // Store binary data
            status,
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Result added successfully."
    });
  } catch (error) {
    fs.unlinkSync(newFilePath);
    console.error("Error adding result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add result. Please try again later.",
    });
  }
};

// Retrieve PDF from MongoDB
const getStudentResult = async (req, res) => {
   try {
     const { id } = req.params;
     const { semesterNumber } = req.query;
     // Get all result by student ID
     if (!semesterNumber) {
       try {
         const result = await Result.findOne({ student: id });
         if (!result) {
           return res.status(404).json({
             success: false,
             message: "Result not Published.",
           });
         }
         // console.log(result.semesters);

         const tosendresult = [];
         result.semesters.forEach((sem) => {
           tosendresult.push({
             semesterNumber: sem.semesterNumber,
             status: sem.status,
           });
         });
         return res.status(200).json({
           success: true,
           result: tosendresult,
         });
       } catch (error) {
         res.status(500).json({
           success: false,
           message: "Failed to retrieve result. Please try again later.",
         });
       }
     }
     //  Find the result by student ID and semester number
     const result = await Result.findOne({
       student: id,
       "semesters.semesterNumber": semesterNumber,
     });

     if (!result) {
       return res.status(404).json({
         success: false,
         message: "Result not Published.",
       });
     }
     const semester = result.semesters.find(
       (sem) => sem.semesterNumber === parseInt(semesterNumber)
     );

     if (!semester || !semester.resultPdf) {
       return res.status(404).json({
         success: false,
         message: "Semester result not found.",
       });
     }

     // Read and send the PDF file
     const filePath = semester.resultPdf; // Path stored in DB
     if (!fs.existsSync(filePath)) {
       return res.status(404).json({
         success: false,
         message: "Result file not found on server.",
       });
     }

     res.setHeader("Content-Type", "application/pdf");
     res.setHeader(
       "Content-Disposition",
       `attachment; filename=Result_Semester_${semesterNumber}.pdf`
     );
     const fileStream = fs.createReadStream(filePath);
     fileStream.pipe(res);
   } catch (error) {
     res.status(500).json({
       success: false,
       message: "Failed to retrieve result. Please try again later.",
     });
   }
};

module.exports = { addStudentResult, getStudentResult };
