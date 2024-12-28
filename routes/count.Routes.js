const express = require("express");
const router = express.Router();
const {
  allStudents,
  activeStudents,
} = require("../controllers/count.Controller");

router.get("/students", allStudents);
router.get("/activestudents", activeStudents);

module.exports = router;