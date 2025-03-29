import express from "express";
import { createShipment, getAllShipmentsForAdmin, getShipmentsByCustomer, searchShipmentsByName, updatePastCompliance, updateShipment, uploadShipmentsCSV } from "../controllers/shipment.js";
import upload from "../middleware/multerConfig.js";
import { getAllCustomers } from "../controllers/customer.js";

const router = express.Router();

router.post("/createshipment", createShipment);
router.post("/uploadcsv", upload.single("file"), uploadShipmentsCSV);
router.post("/getallshipments", getAllShipmentsForAdmin);
router.post("/searchshipment", searchShipmentsByName);
router.post("/usershipments", getShipmentsByCustomer);
router.put("/updatependingshipment", updateShipment);
router.get("/getallcustomers", getAllCustomers); 
router.put("/updpastcomp", updatePastCompliance);

export default router;
