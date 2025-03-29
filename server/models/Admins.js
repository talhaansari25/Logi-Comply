import mongoose from "mongoose";

const Admins = new mongoose.Schema({
  name: { type: String, required: true }, // Full name of the admin
  email: { type: String, required: true, unique: true }, // Unique email for login
  password: { type: String, required: true }, // Hashed password for security
  phone: { type: String, required: true }, // Contact number
  role: { type: String, default: "Admin" }, // Role assigned to the user
  isVerified: { type: Boolean, default: false }, // Check if admin is verified
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Admins", Admins);
