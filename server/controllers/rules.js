import Rules from "../models/Rules.js";

export const createRule = async (req, res) => {
    try {
        const {
            ruleName, ruleType, applicableCategories, 
            declaredValueLimits, maxWeightLimits, maxQuantityLimits, 
            restrictedCountries, restrictedItems, specialClearanceRequired, notes
        } = req.body;

        if (!ruleName || !ruleType) {
            return res.status(400).json({ error: "Rule name and type are required" });
        }

        // Validate limits structure (should be an object with country → category mapping)
        if (declaredValueLimits && typeof declaredValueLimits !== "object") {
            return res.status(400).json({ error: "Invalid format for declaredValueLimits" });
        }
        if (maxWeightLimits && typeof maxWeightLimits !== "object") {
            return res.status(400).json({ error: "Invalid format for maxWeightLimits" });
        }
        if (maxQuantityLimits && typeof maxQuantityLimits !== "object") {
            return res.status(400).json({ error: "Invalid format for maxQuantityLimits" });
        }

        const rule = new Rules({
            ruleName,
            ruleType,
            applicableCategories: applicableCategories || ["All"],
            declaredValueLimits: declaredValueLimits || {},
            maxWeightLimits: maxWeightLimits || {},
            maxQuantityLimits: maxQuantityLimits || {},
            restrictedCountries: restrictedCountries || [],
            restrictedItems: restrictedItems || [],
            specialClearanceRequired: specialClearanceRequired || false,
            notes: notes || ""
        });

        await rule.save();

        res.status(201).json({ message: "Compliance rule created successfully", rule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Retrieve all Compliance Rules
export const getAllRules = async (req, res) => {
    try {
        const rules = await Rules.find().sort({ createdAt: -1 });

        res.status(200).json({ message: "Compliance rules retrieved successfully", totalRules: rules.length, rules });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Compliance Rule
export const updateRule = async (req, res) => {
    try {
        const { ruleId, ...updateData } = req.body;

        if (!ruleId) {
            return res.status(400).json({ error: "Rule ID is required" });
        }

        const updatedRule = await Rules.findByIdAndUpdate(ruleId, updateData, { new: true });

        if (!updatedRule) {
            return res.status(404).json({ error: "Compliance rule not found" });
        }

        res.status(200).json({ message: "Compliance rule updated successfully", updatedRule });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Compliance Rule
export const deleteRule = async (req, res) => {
    try {
        const { ruleId } = req.body;

        if (!ruleId) {
            return res.status(400).json({ error: "Rule ID is required" });
        }

        const deletedRule = await Rules.findByIdAndDelete(ruleId);
        if (!deletedRule) {
            return res.status(404).json({ error: "Compliance rule not found" });
        }

        res.status(200).json({ message: "Compliance rule deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// export const validateShipment = async (shipment) => {
//     const rules = await Rules.findOne({ ruleType: "Value Limit" }); // Get the rule

//     let violations = [];
    
//     let status = "Flagged"

//     // Check Declared Value Limit
//     if (rules.declaredValueLimits.has(shipment.destinationCountry)) {
//         const countryLimits = rules.declaredValueLimits.get(shipment.destinationCountry);
//         if (countryLimits.has(shipment.category) && shipment.declaredValue > countryLimits.get(shipment.category)) {
//             violations.push(`Declared value for ${shipment.category} in ${shipment.destinationCountry} exceeds limit.`);
//         }
//         status = "Flagged"
//     }

//     // Check Weight Limit
//     if (rules.maxWeightLimits.has(shipment.destinationCountry)) {
//         const weightLimits = rules.maxWeightLimits.get(shipment.destinationCountry);
//         if (weightLimits.has(shipment.category) && shipment.weight > weightLimits.get(shipment.category)) {
//             violations.push(`Weight for ${shipment.category} in ${shipment.destinationCountry} exceeds limit.`);
//         }
//     }

//     // Check Quantity Limit
//     if (rules.maxQuantityLimits.has(shipment.destinationCountry)) {
//         const quantityLimits = rules.maxQuantityLimits.get(shipment.destinationCountry);
//         if (quantityLimits.has(shipment.category) && shipment.quantity > quantityLimits.get(shipment.category)) {
//             violations.push(`Quantity for ${shipment.category} in ${shipment.destinationCountry} exceeds limit.`);
//         }
//     }


//     // Restricted Country & Item Check
//     if (rules.restrictedCountries.includes(shipment.destinationCountry)) {
//         violations.push(`Shipping to ${shipment.destinationCountry} is not allowed.`);
//         status = "Rejected"
//     }
//     // if (!(rules.applicableCategories.includes(shipment.category))) {
//     //     violations.push(`Shipping ${shipment.category} is prohibited.`);
//     // }
//     if (rules.restrictedItems.includes(shipment.name)) {
//         violations.push(`Shipping ${shipment.category} is prohibited.`);

//     }

//     // Special Clearance Check
//     if (rules.specialClearanceRequired) {
//         violations.push(`Special clearance is required for this shipment.`);
//     }

//     if (violations.length > 0) {
//         return { status: status, violations };
//     }

//     return { status: "Compliant", message: "Shipment meets all compliance rules." };
// };


export const validateShipment = async (shipment) => {
    const rules = await Rules.find(); // Fetch all rules

    let violations = [];
    let status = "Compliant";

    for (const rule of rules) {
        // Apply rules only if the shipment category is included in applicableCategories
        if (rule.applicableCategories && !rule.applicableCategories.includes(shipment.category)) {
            continue; // Skip this rule if category is not applicable
        }

        // Check Declared Value Limit
        if (rule.declaredValueLimits?.has(shipment.destinationCountry)) {
            const countryLimits = rule.declaredValueLimits.get(shipment.destinationCountry);
            if (countryLimits.has(shipment.category) && shipment.declaredValue > countryLimits.get(shipment.category)) {
                violations.push(`Declared value for ${shipment.category} in ${shipment.destinationCountry} exceeds limit. Max Limit : $${ countryLimits.get(shipment.category)}`);
                status = "Flagged";
            }
        }

        // Check Weight Limit
        if (rule.maxWeightLimits?.has(shipment.destinationCountry)) {
            const weightLimits = rule.maxWeightLimits.get(shipment.destinationCountry);
            if (weightLimits.has(shipment.category) && shipment.weight > weightLimits.get(shipment.category)) {
                violations.push(`Weight for ${shipment.category} in ${shipment.destinationCountry} exceeds limit. Max Limit : ${weightLimits.get(shipment.category)} Kg`);
                status = "Flagged";
            }
        }

        // Check Quantity Limit
        if (rule.maxQuantityLimits?.has(shipment.destinationCountry)) {
            const quantityLimits = rule.maxQuantityLimits.get(shipment.destinationCountry);
            if (quantityLimits.has(shipment.category) && shipment.quantity > quantityLimits.get(shipment.category)) {
                violations.push(`Quantity for ${shipment.category} in ${shipment.destinationCountry} exceeds limit. Max Limit : ${quantityLimits.get(shipment.category)} `);
                status = "Flagged";
            }
        }

        // Restricted Country & Item Check
        if (rule.restrictedCountries?.includes(shipment.destinationCountry)) {
            violations.push(`Shipping to ${shipment.destinationCountry} is not allowed.`);
            status = "Rejected";
        }

        if (rule.restrictedItems?.includes(shipment.name)) {
            violations.push(`Shipping ${shipment.name} is prohibited.`);
            status = "Rejected";
        }

        // Special Clearance Check
        if (rule.specialClearanceRequired) {
            violations.push(`Special clearance is required for this shipment.`);
            status = "Flagged";
        }
    }

    if (violations.length > 0) {
        return { status, violations };
    }

    return { status: "Compliant", message: "Shipment meets all compliance rules." };
};


export const checkShipmentCompliance = async (req, res) => {
    try {
        const shipment = req.body;

        if (!shipment.category || !shipment.declaredValue || !shipment.weight || !shipment.quantity || !shipment.destinationCountry) {
            return res.status(400).json({ error: "Missing required shipment details" });
        }

        // Check compliance using the validation function
        const result = await validateShipment(shipment);

        res.status(200).json({ message: "Shipment validation completed", result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};