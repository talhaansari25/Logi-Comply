import mongoose from "mongoose";

const Shipments = new mongoose.Schema({
  uuid: { type: String, required: true }, // Unique identifier
  name: { type: String, required: true }, // Product name

  category: { 
    type: String, 
    required: true, 
    enum: ["Medicine", "Chemical", "Electronics", "Automobile", "Food", "Jewelry", "Cloth"] 
  }, // Category of product

  declaredValue: { type: Number, required: true }, // Price of the product
  currency: { type: String, default: "INR" }, // Currency (e.g., INR, USD)
  weight: { type: Number, required: true }, // Weight in grams
  quantity: { type: Number, required: true }, // Total units

  dimensions: {
    length: { type: Number }, // Length in cm
    width: { type: Number }, // Width in cm
    height: { type: Number } // Height in cm
  },

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customers", required: true },

  sourceCountry: { type: String, required: true }, // Destination country
  destinationCountry: { type: String, required: true }, // Destination country
  restrictedItem: { type: Boolean, default: false }, // Whether the item is restricted
  pastComplianceIssues: { type: Boolean, default: false }, // History of compliance issues
  shipmentFlagged: { type: Boolean, default: false }, // Whether shipment was flagged

  flagMessage: { type: String, default: "" },

  // Medicine-specific fields
  expirationDate: { type: Date }, // Expiry date (only for medicine)
  requiresPrescription: { type: Boolean }, // If prescription is needed

  // Chemical-specific fields
  hazardClass: { type: String }, // Hazard classification
  handlingInstructions: { type: String }, // Special handling instructions

  // Electronics-specific fields
  batteryIncluded: { type: Boolean }, // If the product contains a battery
  powerRating: { type: String }, // Power consumption (e.g., "220V, 50Hz")

  // Automobile-specific fields
  vehiclePartNumber: { type: String }, // Part number for automobile parts
  compatibility: { type: [String] }, // List of compatible vehicle models

  // Food-specific fields
  perishable: { type: Boolean }, // Whether the item is perishable
  storageTemperature: { type: String }, // Recommended storage temperature

  // Jewelry-specific fields
  material: { type: String }, // Gold, Silver, Diamond, etc.
  weightInCarats: { type: Number }, // Carat weight (if applicable)

  // Cloth-specific fields
  fabricType: { type: String }, // Cotton, Polyester, Silk, etc.
  size: { type: String }, // S, M, L, XL

  // Regulatory Documents
  regulatoryDocs: [{ type: String }], // URLs or File references for uploaded docs

  // HS Code (Generated based on country & product type)
  hsCode: { type: String }, // HS Code format: "123.12.xx"

  // Pricing & Tariff Details
  subTotal: { type: Number }, // Product cost before tariffs
  tariff: { type: Number }, // Tariff cost
  additionalCharges: { type: Number }, // Additional handling charges
  totalCost: { type: Number }, // Final total price calculation

  // Status & Tracking
  status: { type: String, default: "Pending" }, // Status (Pending, Approved, Rejected, In-Transit)
  trackingId: { type: String }, // Shipment tracking ID if available

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Export model
export default mongoose.model("Shipments", Shipments);
