import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from "url";

import customerRoutes from './routes/customer.js'
import adminRoutes from './routes/admin.js'
import shipmentRoutes from './routes/shipment.js'
import rulesRoutes from './routes/rules.js'

const app = express();
app.use(express.json());
app.use(helmet()); // Avoid XSS and Clickjacking
app.use(cors());
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001 || 3002;

mongoose.connect("MONGODB_URL")
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port : ${PORT}`));
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth/customer", customerRoutes);
app.use("/auth/admin", adminRoutes);
app.use("/shipments", shipmentRoutes);
app.use("/rules", rulesRoutes);
