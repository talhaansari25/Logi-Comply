import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true }, // Name of the rule
  ruleType: { 
    type: String, 
    required: true, 
    enum: ["Value Limit", "Weight Limit", "Quantity Limit", "Restricted Country", "Restricted Item", "Special Clearance"] 
  }, // Type of rule

  applicableCategories: { type: [String], default: ["All"] },  // Categories like Electronics, Medicine, etc.

  // ✅ Limits based on category & country
  declaredValueLimits: { 
    type: Map, 
    of: Map, // Nested Map structure: { country -> { category -> value } }
    default: {} 
  },  
  maxWeightLimits: { 
    type: Map, 
    of: Map, 
    default: {} 
  },  
  maxQuantityLimits: { 
    type: Map, 
    of: Map, 
    default: {} 
  },  

  // Restricted countries & items
  restrictedCountries: { type: [String], default: [] }, // Banned countries
  restrictedItems: { type: [String], default: [] }, // Banned products

  specialClearanceRequired: { type: Boolean, default: false }, // If extra clearance is needed

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Rules", ruleSchema);
