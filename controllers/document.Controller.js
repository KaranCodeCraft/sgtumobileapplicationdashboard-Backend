const Student = require("../models/Student");
const path = require("path");
const fs = require("fs");

const documentupload = async (req, res) => {
    try {
        const { studentId, docName } = req.body;
       
        // Validate if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "PDF file is required.",
            });
        }
        // Check for dir and create if not exists
        const documentFolder = path.join(__dirname, "../document");
        if (!fs.existsSync(documentFolder)) {
            fs.mkdirSync(documentFolder);
        }
        // Move the file to the document folder
        const newFilePath = path.join(
          documentFolder,
          `${studentId}_${docName}.pdf`
        );
        const tempFilePath = req.file.path
        fs.renameSync(tempFilePath, newFilePath);
        const result = await Student.findByIdAndUpdate(
          studentId,
          {
            $set: {
              // Dynamically update the document field based on docName
              [`document.${docName}`]: newFilePath, // Set the file path for the specified document
            },
          },
          { new: true }
        );
        
        res.status(200).json({message: "Document uploaded successfully"});
    } catch (error) {
        console.log(error);
        // fs.unlinkSync(newFilePath);
        res.status(500).json({message: "Failed to upload document. Please try again later."});
    }
}
const documentview = async (req, res) => {
    res.status(200).json({message: "Document View successfully"});
}
module.exports = { documentupload, documentview };