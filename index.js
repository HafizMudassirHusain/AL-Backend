import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import slideRoutes from "./routes/slideRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Add this line under other route middleware
app.use("/api/slides", slideRoutes);
// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to MZ Kitchen API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
