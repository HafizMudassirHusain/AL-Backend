import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect admin routes

const router = express.Router();

// ✅ Place a new order
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

// ✅ Update Order Status (Admin Only)
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

// ✅ Delete an Order
router.delete("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
});

// ✅ Get Orders with Date Filtering
router.get("/", async (req, res) => {
  try {
    const { filter } = req.query; // Get filter from query params
    let startDate;

    if (filter === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Start of today
    } else if (filter === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
    } else if (filter === "month") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
    }

    let query = {};
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

export default router;
