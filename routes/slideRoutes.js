import express from "express";
import Slide from "../models/slideModel.js";

const router = express.Router();

// Get all slides
router.get("/", async (req, res) => {
  try {
    const slides = await Slide.find();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: "Error fetching slides" });
  }
});

// Add a new slide
router.post("/", async (req, res) => {
  const { text, subtext, image } = req.body;

  try {
    const newSlide = new Slide({ text, subtext, image });
    await newSlide.save();
    res.status(201).json(newSlide);
  } catch (error) {
    res.status(500).json({ message: "Error adding slide" });
  }
});

// Update a slide
router.put("/:id", async (req, res) => {
  const { text, subtext, image } = req.body;

  try {
    const updatedSlide = await Slide.findByIdAndUpdate(
      req.params.id,
      { text, subtext, image },
      { new: true }
    );
    res.json(updatedSlide);
  } catch (error) {
    res.status(500).json({ message: "Error updating slide" });
  }
});

// Delete a slide
router.delete("/:id", async (req, res) => {
  try {
    await Slide.findByIdAndDelete(req.params.id);
    res.json({ message: "Slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting slide" });
  }
});

export default router;
