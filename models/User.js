const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: false }, // True if active, false if inactive
  role: {
    type: String,
    enum: ["admin", "user"], // You can modify the roles as needed
    default: "user", // Default role is "user"
  },
});

module.exports = mongoose.model("User", UserSchema);