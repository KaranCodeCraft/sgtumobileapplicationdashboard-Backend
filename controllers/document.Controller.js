const Student = require("../models/Student");
const path = require("path");
const fs = require("fs");
const {z} = require("zod");

// Define the schema for the document upload request
const documentUploadSchema = z.object({
  studentId: z.string().nonempty(),
  docName: z
    .enum(["aadhar", "photo", "pan", "interMarksheet"]),
});

const documentupload = async (req, res) => {
    try {
      const { studentId, docName } = req.body;
      // Validate the request body
        documentUploadSchema.parse({ studentId, docName });

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
        if(error.errors) {
            return res.status(400).json({message: error.errors[0].message});
        }
        // fs.unlinkSync(newFilePath);
        res.status(500).json({message: "Failed to upload document. Please try again later."});
    }
}
const documentview = async (req, res) => {
  try {
    const { studentId, docName } = req.body;
    // Validate the request body
    documentUploadSchema.parse({ studentId, docName });
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const documentPath = student.document[docName];
    if (!documentPath) {
      return res.status(404).json({ message: "Document not found" });
    }
    const document = fs.readFileSync(documentPath);
    res.contentType("application/pdf");
    res.send(document);
  } catch (error) {
    console.log(error);
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    } 
  }
}
module.exports = { documentupload, documentview };