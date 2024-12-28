const express = require('express');
const router = express.Router();
const {
  addStudentResult,
  getStudentResult,
} = require("../controllers/result.Controller");
const upload = require("../middlewares/multer");

// Get a specific result
router.get("/:id", getStudentResult);

// Create a new result
router.post('/',upload.single('file'), addStudentResult);

// Update a result
// router.patch('/:id', updateStudentresult);

// Delete a result
// router.delete('/:id', deleteStudentResult);


module.exports = router;