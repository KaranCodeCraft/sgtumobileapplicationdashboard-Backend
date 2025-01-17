const express = require("express");
const cors = require("cors");
const multer = require("multer");
const authRoutes = require("./routes/auth.Routes");
const studentRoutes = require("./routes/student.Routes");
const bulkStudentRoutes = require("./routes/bulkStudent.Routes");
const path = require("path");
const dbConnect = require("./middlewares/db");
const { verifyToken, checkRole } = require("./middlewares/auth");
// const SuperAdmin = require("./middlewares/admin");
const notificationRoute = require("./routes/notification.Routes");
const countRoute = require("./routes/count.Routes");
const resultRoute = require("./routes/result.Routes");

// dbConnect().then(() => {
//   SuperAdmin();
// });

dbConnect();

const app = express();
app.use(express.json());
app.use(cors());

const FILE_SIZE_LIMIT = 2 * 1024 * 1024;

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls" && ext !== ".csv") {
      return cb(
        new Error("Only Excel files (.xlsx or .xls) are allowed"),
        false
      );
    }
    cb(null, true);
  },
});

app.use("/auth", authRoutes);
app.use("/student", studentRoutes);
app.use(
  "/bulkupload",
  verifyToken,
  checkRole("admin"),
  upload.single("file"),
  bulkStudentRoutes
);
app.use("/notification", notificationRoute);
app.use("/count", verifyToken, checkRole("admin"), countRoute);
app.use("/result", resultRoute);
app.get("/verifyToken", verifyToken, (req, res) => {
  return res.json({ message: "Access granted!", user: req.user });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message, error: "MulterError" });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

app.listen(5005, () => {
  console.log("Server running on port 5005");
});
