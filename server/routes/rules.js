import express from "express";
import { createRule, getAllRules, updateRule, deleteRule } from "../controllers/rules.js";
import { checkShipmentCompliance } from "../controllers/rules.js";

const router = express.Router();

router.post("/create", createRule);
router.get("/getallrules", getAllRules);
router.put("/update", updateRule);
router.delete("/delete", deleteRule);
router.post("/checkshipmentcompliance", checkShipmentCompliance);

export default router;
