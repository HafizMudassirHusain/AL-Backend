import express from "express";
import Menu from "../models/Menu.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Add a new menu item with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const image = req.file.path; // Cloudinary URL

    const newMenuItem = new Menu({ name, category, price, description, image });
    await newMenuItem.save();

    res.status(201).json({ message: "Menu item added", menuItem: newMenuItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding menu item", error });
  }
});

// ✅ Route to Get All Menu Items
router.get("/", async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu", error });
  }
});

export default router;
