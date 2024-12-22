const express = require("express");
const router = express.Router();
const { bulkStudenthandle } = require("../controllers/bulk.Controller");

router.post("/students", bulkStudenthandle);

module.exports = router;