import express from "express";
import Menu from "../models/Menu.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ✅ Add a new menu item with image upload
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

// ✅ Update Menu Item (Edit)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let image = req.file ? req.file.path : undefined; // Only update if a new image is uploaded

    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { name, category, price, description, ...(image && { image }) },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item updated", menuItem: updatedMenuItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating menu item", error });
  }
});

// ✅ Delete Menu Item
router.delete("/:id", async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu item", error });
  }
});

export default router;
