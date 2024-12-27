const User = require("../models/User"); // Import User model

async function checkAndCreateSuperAdmin() {
  try {
    console.log("Checking for superadmin...");
    const superAdmin = await User.findOne({ role: "admin" });

    if (!superAdmin) {
      console.log("Superadmin not found, creating one...");

      const newSuperAdmin = new User({
        name: "superadmin",
        email: "admin@admin.com",
        active: true,
        password: "securepassword123",
        role: "admin",
      });

      await newSuperAdmin.save();
      console.log("Superadmin created successfully.");
    } else {
      console.log("Superadmin already exists.");
    }
  } catch (error) {
    console.error("Error while checking/creating superadmin:", error);
  }
}

module.exports = checkAndCreateSuperAdmin; // Export the function
