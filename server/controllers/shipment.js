
import Shipments from "../models/Shipments.js";
import Customers from "../models/Customers.js";
import Admins from '../models/Admins.js'
import { v4 as uuidv4 } from "uuid"; 
import csv from "fast-csv";
import fs from "fs";
import path from "path";

// Create Shipment
export const createShipment = async (req, res) => {
    try {
        const {
            customerId,
            name,
            category,
            declaredValue,
            currency,
            weight,
            quantity,
            dimensions,
            sourceCountry,
            destinationCountry,
            restrictedItem,
            pastComplianceIssues,
            shipmentFlagged,
            expirationDate,
            requiresPrescription,
            hazardClass,
            handlingInstructions,
            batteryIncluded,
            powerRating,
            vehiclePartNumber,
            compatibility,
            perishable,
            storageTemperature,
            material,
            weightInCarats,
            fabricType,
            size,
            regulatoryDocs,
            hsCode,
            subTotal,
            tariff,
            flagMessage,
            additionalCharges,
            totalCost,
            status,
            trackingId
        } = req.body;

        if (!customerId || !name || !category || !declaredValue || !weight || !destinationCountry || !sourceCountry) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const customer = await Customers.findById(customerId);
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        // Generate a unique UUID
        const uuid = uuidv4();

        const newShipment = new Shipments({
            uuid,
            customerId,
            name,
            category,
            declaredValue,
            currency : "USD",
            weight,
            quantity,
            dimensions,
            sourceCountry,
            destinationCountry,
            restrictedItem,
            pastComplianceIssues,
            shipmentFlagged,
            expirationDate,
            requiresPrescription,
            hazardClass,
            handlingInstructions,
            batteryIncluded,
            powerRating,
            vehiclePartNumber,
            compatibility,
            perishable,
            storageTemperature,
            material,
            weightInCarats,
            fabricType,
            size,
            regulatoryDocs,
            hsCode,
            flagMessage,
            subTotal,
            tariff,
            additionalCharges,
            totalCost,
            status,
            trackingId
        });

        const savedShipment = await newShipment.save();

        customer.shipmentHistory.push(savedShipment._id);
        await customer.save();

        res.status(201).json({ message: "Shipment created successfully", shipment: savedShipment });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk Upload Shipments via CSV (Customer ID from Body)
// export const uploadShipmentsCSV = async (req, res) => {
//     try {
        
//         const { customerId } = req.body;
//         if (!customerId) {
//             return res.status(400).json({ error: "Customer ID is required" });
//         }

//         // Check if customer exists
//         const customer = await Customers.findById(customerId);
//         if (!customer) {
//             return res.status(404).json({ error: "Customer not found" });
//         }

//         if (!req.file) {
//             return res.status(400).json({ error: "CSV file is required" });
//         }

//         const shipments = [];
//         const filePath = req.file.path;

//         fs.createReadStream(filePath)
//             .pipe(csv.parse({ headers: true }))
//             .on("data", async (row) => {
//                 try {
//                     // Generate UUID
//                     const uuid = uuidv4();

//                     // Create shipment object dynamically based on category
//                     const shipment = {
//                         uuid,
//                         customerId, 
//                         sourceCountry : row.sourceCountry, 
//                         destinationCountry: row.destinationCountry,
//                         name: row.name,
//                         category: row.category,
//                         declaredValue: parseFloat(row.declaredValue),
//                         currency: row.currency, 
//                         weight: parseFloat(row.weight),
//                         quantity: parseInt(row.quantity),
//                         dimensions: {
//                             length: parseFloat(row.length) || null,
//                             width: parseFloat(row.width) || null,
//                             height: parseFloat(row.height) || null
//                         },
//                         hsCode: row.hsCode,
//                         subTotal: parseFloat(row.subTotal),
//                         tariff: parseFloat(row.tariff),
//                         additionalCharges: parseFloat(row.additionalCharges),
//                         totalCost: parseFloat(row.totalCost),
//                         status: row.status,
//                         trackingId: row.trackingId
//                     };

//                     // Handle category-specific attributes
//                     switch (row.category.toLowerCase()) {
//                         case "medicine":
//                             shipment.expirationDate = row.expirationDate ? new Date(row.expirationDate) : null;
//                             shipment.requiresPrescription = row.requiresPrescription?.toLowerCase() === "true";
//                             break;
//                         case "chemical":
//                             shipment.hazardClass = row.hazardClass;
//                             shipment.handlingInstructions = row.handlingInstructions;
//                             break;
//                         case "electronics":
//                             shipment.batteryIncluded = row.batteryIncluded?.toLowerCase() === "true";
//                             shipment.powerRating = row.powerRating;
//                             break;
//                         case "automobile":
//                             shipment.vehiclePartNumber = row.vehiclePartNumber;
//                             shipment.compatibility = row.compatibility ? row.compatibility.split(",") : [];
//                             break;
//                         case "food":
//                             shipment.perishable = row.perishable?.toLowerCase() === "true";
//                             shipment.storageTemperature = row.storageTemperature;
//                             break;
//                         case "jewelry":
//                             shipment.material = row.material;
//                             shipment.weightInCarats = parseFloat(row.weightInCarats);
//                             break;
//                         case "cloth":
//                             shipment.fabricType = row.fabricType;
//                             shipment.size = row.size;
//                             break;
//                     }

//                     shipments.push(shipment);
//                 } catch (error) {
//                     console.log("Error processing row:", error.message);
//                 }
//             })
//             .on("end", async () => {
//                 try {
//                     // Insert all shipments into the database
//                     const insertedShipments = await Shipments.insertMany(shipments);

//                     // Add all shipment IDs to the customer's shipmentHistory
//                     const shipmentIds = insertedShipments.map(s => s._id);
//                     await Customers.findByIdAndUpdate(
//                         customerId,
//                         { $push: { shipmentHistory: { $each: shipmentIds } } }
//                     );

//                     res.status(201).json({ message: "Shipments uploaded successfully", shipments: insertedShipments });
//                 } catch (error) {
//                     res.status(500).json({ error: "Error saving shipments" });
//                 }

//                 // Delete the uploaded file after processing
//                 fs.unlinkSync(filePath);
//             });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

export const uploadShipmentsCSV = async (req, res) => {
    try {
        const { customerId, shipments } = req.body; // Get customerId & shipments array

        if (!customerId) return res.status(400).json({ error: "Customer ID is required" });

        // Check if customer exists
        const customer = await Customers.findById(customerId);
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
            return res.status(400).json({ error: "No shipment data provided." });
        }

        let processedShipments = [];

        // ✅ Step 1: Process Each Shipment
        for (const row of shipments) {
            try {
                // Generate UUID
                const uuid = uuidv4();

                // Format shipment object
                const shipment = {
                    uuid,
                    customerId,
                    sourceCountry: row.sourceCountry,
                    destinationCountry: row.destinationCountry,
                    name: row.name,
                    category: row.category,
                    declaredValue: parseFloat(row.declaredValue),
                    currency: row.currency,
                    weight: parseFloat(row.weight),
                    quantity: parseInt(row.quantity),
                    dimensions: {
                        length: parseFloat(row.length) || null,
                        width: parseFloat(row.width) || null,
                        height: parseFloat(row.height) || null
                    },
                    hsCode: row.hsCode,
                    subTotal: parseFloat(row.subTotal),
                    tariff: parseFloat(row.tariff),
                    additionalCharges: parseFloat(row.additionalCharges),
                    totalCost: parseFloat(row.totalCost),
                    trackingId: row.trackingId,
                    flagMessage : row.flagMessage,
                    shipmentFlagged : row.shipmentFlagged,
                    status : row.status
                };

                // ✅ Step 2: Handle Category-Specific Attributes
                switch (row.category.toLowerCase()) {
                    case "medicine":
                        shipment.expirationDate = row.expirationDate ? new Date(row.expirationDate) : null;
                        shipment.requiresPrescription = row.requiresPrescription?.toLowerCase() === "true";
                        break;
                    case "chemical":
                        shipment.hazardClass = row.hazardClass;
                        shipment.handlingInstructions = row.handlingInstructions;
                        break;
                    case "electronics":
                        shipment.batteryIncluded = row.batteryIncluded?.toLowerCase() === "true";
                        shipment.powerRating = row.powerRating;
                        break;
                    case "automobile":
                        shipment.vehiclePartNumber = row.vehiclePartNumber;
                        shipment.compatibility = row.compatibility ? row.compatibility.split(",") : [];
                        break;
                    case "food":
                        shipment.perishable = row.perishable?.toLowerCase() === "true";
                        shipment.storageTemperature = row.storageTemperature;
                        break;
                    case "jewelry":
                        shipment.material = row.material;
                        shipment.weightInCarats = parseFloat(row.weightInCarats);
                        break;
                    case "cloth":
                        shipment.fabricType = row.fabricType;
                        shipment.size = row.size;
                        break;
                }

                // ✅ Step 3: Validate Shipment Compliance
                // const complianceResult = await checkShipmentCompliance(shipment);

                // if (complianceResult.status === "Flagged") {
                //     shipment.shipmentFlagged = true;
                //     shipment.status = "Pending";
                //     shipment.flagMessage = complianceResult.violations.join(", ");
                // } else if (complianceResult.status === "Rejected") {
                //     shipment.shipmentFlagged = true;
                //     shipment.status = "Rejected";
                //     shipment.flagMessage = complianceResult.violations.join(", ");
                // } else {
                //     shipment.shipmentFlagged = false;
                //     shipment.status = "Approved";
                //     shipment.flagMessage = "Shipment Approved";
                // }

                processedShipments.push(shipment);
            } catch (error) {
                console.log("Error processing shipment:", error.message);
            }
        }

        // ✅ Step 4: Insert Validated Shipments into Database
        const insertedShipments = await Shipments.insertMany(processedShipments);

        // ✅ Step 5: Update Customer's Shipment History
        const shipmentIds = insertedShipments.map(s => s._id);
        await Customers.findByIdAndUpdate(customerId, { $push: { shipmentHistory: { $each: shipmentIds } } });

        res.status(201).json({
            message: "Shipments uploaded successfully",
            approved: insertedShipments.filter(s => s.status === "Approved").length,
            flagged: insertedShipments.filter(s => s.status === "Pending").length,
            rejected: insertedShipments.filter(s => s.status === "Rejected").length,
            shipments: insertedShipments
        });

    } catch (error) {
        console.error("Error uploading shipments:", error);
        res.status(500).json({ error: error.message });
    }
};


// Retrieve Shipments with Pagination, Filtering & Sorting (Only Verified Admins)
export const getAllShipmentsForAdmin = async (req, res) => {
    try {
        const { 
            adminId, 
            page = 1, 
            limit = 5, 
            category, 
            sourceCountry, 
            destinationCountry, 
            shipmentFlagged, 
            status, 
            sortBy, 
            sortOrder = "asc" // Default sorting order: ascending
        } = req.body;

        if (!adminId) {
            return res.status(400).json({ error: "Admin ID is required" });
        }

        const admin = await Admins.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        if (!admin.isVerified) {
            return res.status(403).json({ error: "Admin is not verified" });
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let filterQuery = {};

        if (category) filterQuery.category = category;
        if (sourceCountry) filterQuery.sourceCountry = sourceCountry;
        if (destinationCountry) filterQuery.destinationCountry = destinationCountry;
        if (shipmentFlagged !== undefined) filterQuery.shipmentFlagged = shipmentFlagged;
        if (status) filterQuery.status = status;

        // Sorting options
        let sortQuery = {};
        const allowedSortFields = ["weight", "quantity", "declaredValue", "totalCost", "tariff"];
        if (sortBy && allowedSortFields.includes(sortBy)) {
            sortQuery[sortBy] = sortOrder === "desc" ? -1 : 1; // Ascending (1) or Descending (-1)
        }

        // Retrieve shipments with pagination, filtering, and sorting
        const shipments = await Shipments.find(filterQuery)
            .sort(sortQuery) // Apply sorting
            .skip(skip)
            .limit(limitNumber);

        const totalShipments = await Shipments.countDocuments(filterQuery);

        res.status(200).json({
            message: "Shipments retrieved successfully",
            totalShipments,
            totalPages: Math.ceil(totalShipments / limitNumber),
            currentPage: pageNumber,
            shipments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search Shipments by Name (Only Verified Admins)
export const searchShipmentsByName = async (req, res) => {
    try {
        const { adminId, name, page = 1, limit = 10 } = req.body;

        if (!adminId) {
            return res.status(400).json({ error: "Admin ID is required" });
        }

        const admin = await Admins.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        if (!admin.isVerified) {
            return res.status(403).json({ error: "Admin is not verified" });
        }

        if (!name) {
            return res.status(400).json({ error: "Shipment name is required" });
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const searchQuery = { name: { $regex: new RegExp(name, "i") } };

        const shipments = await Shipments.find(searchQuery)
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limitNumber);

        const totalShipments = await Shipments.countDocuments(searchQuery);

        res.status(200).json({
            message: "Shipments retrieved successfully",
            totalShipments,
            totalPages: Math.ceil(totalShipments / limitNumber),
            currentPage: pageNumber,
            shipments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retrieve All Shipments of a Particular User (Customer) using shipmentHistory
export const getShipmentsByCustomer = async (req, res) => {
    try {
        const { customerId, page = 1, limit = 10000 } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: "Customer ID is required" });
        }

        const customer = await Customers.findById(customerId).populate("shipmentHistory");
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const shipmentIds = customer.shipmentHistory.map(shipment => shipment._id);

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const shipments = await Shipments.find({ _id: { $in: shipmentIds } })
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limitNumber);

        const totalShipments = shipmentIds.length;

        res.status(200).json({
            message: "Shipments retrieved successfully",
            totalShipments,
            totalPages: Math.ceil(totalShipments / limitNumber),
            currentPage: pageNumber,
            shipments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateShipment = async (req, res) => {
    try {
      const { customerId, shipmentId, updates } = req.body;
  
      // Validate required fields
      if (!customerId || !shipmentId) {
        return res.status(400).json({ error: "Customer ID and Shipment ID are required." });
      }
  
      // Find the shipment
      const shipment = await Shipments.findOne({ _id: shipmentId, customerId });
  
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found or you are not authorized." });
      }
  
      // Check if the shipment is pending
      if (shipment.status !== "Pending") {
        return res.status(400).json({ error: "Shipment update is not allowed. Status must be 'Pending'." });
      }
  
      // Update shipment details
      Object.keys(updates).forEach((key) => {
        shipment[key] = updates[key];
      });
  
      await shipment.save();
  
      res.status(200).json({ message: "Shipment updated successfully", updatedShipment: shipment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const updatePastCompliance = async (req, res) => {
    try {
      const { shipmentId, pastComplianceIssues } = req.body;
  
      if (!shipmentId || typeof pastComplianceIssues !== "boolean") {
        return res.status(400).json({ error: "Invalid request. Shipment ID and pastComplianceIssues (true/false) are required." });
      }
  
      // Find and update only the pastComplianceIssues field
      const updatedShipment = await Shipments.findByIdAndUpdate(
        shipmentId,
        { $set: { pastComplianceIssues } },
        { new: true }
      );
  
      if (!updatedShipment) {
        return res.status(404).json({ error: "Shipment not found." });
      }
  
      return res.json({ message: "Shipment updated successfully.", updatedShipment });
    } catch (error) {
      console.error("Error updating shipment past compliance:", error);
      return res.status(500).json({ error: "Failed to update shipment past compliance." });
    }
  };