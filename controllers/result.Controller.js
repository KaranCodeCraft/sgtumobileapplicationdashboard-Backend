const fs = require("fs");
const Result = require("../models/Result");

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

    // Read the uploaded file
    const pdfData = fs.readFileSync(req.file.path);

    // Check if the result already exists
    const existingResult = await Result.findOne({
      student: studentId,
      "semesters.semesterNumber": semesterNumber,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "Result already published for this semester.",
      });
    }

    const result = await Result.findOneAndUpdate(
      { student: studentId },
      {
        $push: {
          semesters: {
            semesterNumber,
            resultPdf: pdfData, // Store binary data
            status,
          },
        },
      },
      { new: true, upsert: true }
    );

    // Delete the file from temporary storage
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Result added successfully."
    });
  } catch (error) {
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
     if(!semesterNumber){
        try {
          const result = await Result.findOne({ student: id });
          if (!result) {
            return res.status(404).json({
              success: false,
              message: "Result not Published.",
            });
          }
          // console.log(result.semesters);
          
          const tosendresult = []
          result.semesters.forEach((sem)=>{
            tosendresult.push({
              semesterNumber: sem.semesterNumber,
              status: sem.status,
            })
          })
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

     if (!semester) {
       return res.status(404).json({
         success: false,
         message: "Semester result not found.",
       });
     }

     res.setHeader("Content-Type", "application/pdf");
     res.setHeader(
       "Content-Disposition",
       `attachment; filename=Result_Semester_${semesterNumber}.pdf`
     );
     res.send(semester.resultPdf);
   } catch (error) {
     res.status(500).json({
       success: false,
       message: "Failed to retrieve result. Please try again later.",
     });
   }
};

module.exports = { addStudentResult, getStudentResult };
