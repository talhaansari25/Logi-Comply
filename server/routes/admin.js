import express from "express";
import { body } from "express-validator";
import { adminSignup, adminLogin, fetchAdminById } from "../controllers/admin.js";

const router = express.Router();

router.post(
    "/signup", 
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    adminSignup
);

router.post("/login", adminLogin);
router.post("/fetch", fetchAdminById);
    
export default router;
