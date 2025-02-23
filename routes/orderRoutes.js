import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect admin routes

const router = express.Router();

// Place a new order
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, address, items, totalPrice } = req.body;

    const newOrder = new Order({
      customerName,
      phone,
      address,
      items,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error });
  }
});

// ✅ Correct Route for Updating Order Status
router.put("/:orderId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});
// Get all orders (for admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

export default router;
