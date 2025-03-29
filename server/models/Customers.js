import mongoose from "mongoose";

const Customers = new mongoose.Schema({
  name: { type: String, required: true }, // Full name of the customer
  email: { type: String, required: true, unique: true }, // Unique email for login
  password: { type: String, required: true }, // Hashed password for security
  phone: { type: String, required: true }, // Contact number
  companyName: { type: String }, // Company name (optional)
  address: { type: String }, // Business address
  shipmentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shipments" }], // Past shipments
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Customers", Customers);
