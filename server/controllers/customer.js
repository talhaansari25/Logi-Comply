
import Customers from '../models/Customers.js'
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

// Customer Signup API
export const customerSignup = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password, phone, companyName, address } = req.body;

        const existingCustomer = await Customers.findOne({ email });
        if (existingCustomer) return res.status(400).json({ error: "Email already registered" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new Customers({ 
            name, 
            email, 
            password: hashedPassword, 
            phone, 
            companyName, 
            address     
        });

        await newCustomer.save();
        res.status(201).json({ message: "Customer registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Customer Login API
export const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const customer = await Customers.findOne({ email });
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: customer._id }, "SECRET_KEY", { expiresIn: "12h" });

        res.status(200).json({
            message: "Login successful",
            token,
            profile: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                companyName: customer.companyName,
                address: customer.address
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch Customer Data API
export const fetchCustomerById = async (req, res) => {
    try {
        const { id } = req.body; 

        if (!id) return res.status(400).json({ error: "Customer ID is required" });

        const customer = await Customers.findById(id).select("-password"); 

        if (!customer) return res.status(404).json({ error: "Customer not found" });

        res.status(200).json({ profile: customer });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        // Get total number of customers
        const totalCustomers = await Customers.countDocuments();

        // Fetch customers with pagination
        const customers = await Customers.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-password"); // Exclude password field

        res.status(200).json({
            totalCustomers,
            totalPages: Math.ceil(totalCustomers / limit),
            currentPage: page,
            customers,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
