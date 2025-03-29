import express from "express";
import { body } from "express-validator";
import { customerSignup, customerLogin, fetchCustomerById, getAllCustomers } from "../controllers/customer.js";

const router = express.Router();

router.post(
    "/signup", 
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    customerSignup
);

router.post("/login", customerLogin);
router.post("/fetch", fetchCustomerById);


export default router;
