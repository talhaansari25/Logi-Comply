import Admins from "../models/Admins.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";


export const adminSignup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password, phone } = req.body;

        const existingAdmin = await Admins.findOne({ email });
        if (existingAdmin) return res.status(400).json({ error: "Email already registered" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admins({ 
            name, 
            email, 
            password: hashedPassword, 
            phone 
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin Login API
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admins.findOne({ email });
        if (!admin) return res.status(404).json({ error: "Admin not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: admin._id, role: admin.role }, "SECRET_KEY", { expiresIn: "12h" });

        res.status(200).json({
            message: "Login successful",
            token,
            profile: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                isVerified: admin.isVerified
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch Admin Data by ID
export const fetchAdminById = async (req, res) => {
    try {
        const { id } = req.body; 

        if (!id) return res.status(400).json({ error: "Admin ID is required" });

        const admin = await Admins.findById(id).select("-password"); // Exclude password

        if (!admin) return res.status(404).json({ error: "Admin not found" });

        res.status(200).json({ profile: admin });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};