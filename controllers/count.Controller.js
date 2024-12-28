const Student = require("../models/Student")
const allStudents = async (req, res) => {
    try {
        const students = await Student.countDocuments();
        return res.status(200).json({students});
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
}

const activeStudents = async (req, res) => {
    try {
        const students = await Student.countDocuments({
          "appRegisDetails.status": true,
        });
        return res.status(200).json({students});
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
}

module.exports = { allStudents, activeStudents };