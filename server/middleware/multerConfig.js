import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
    destination: uploadDir, // Uploads folder
    filename: (req, file, cb) => {
        cb(null, "shipment_upload_" + Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File type validation (Only allow CSV files)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "text/csv") {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed"), false);
    }
};

// Multer upload configuration
const upload = multer({ storage, fileFilter });

export default upload;
