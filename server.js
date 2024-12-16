const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.Routes"); 
const studentRoutes = require("./routes/student.Routes"); 
const notificationsRoutes = require("./routes/notification.Routes"); 


const app = express();
app.use(express.json()); 
app.use(cors()); 

// For Dashboard User
app.use("/auth", authRoutes); 


// For Mobile Application
app.use("/student", studentRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
