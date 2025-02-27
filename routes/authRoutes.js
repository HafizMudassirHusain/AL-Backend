import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// ✅ Check if a Super Admin already exists
const checkSuperAdminExists = async () => {
  const superAdmin = await User.findOne({ role: "super-admin" });
  return !!superAdmin;
};

// ✅ Register User (Default Role: Customer, Prevent Multiple Super Admins)
router.post(
  "/register",
  [
    body("name").not().isEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, role } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      // 🔥 Prevent multiple Super Admins
      if (role === "super-admin") {
        const superAdminExists = await checkSuperAdminExists();
        if (superAdminExists) return res.status(400).json({ message: "Super Admin already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "customer", // Default role is "customer"
      });

      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  }
);

// ✅ Login Route (Supports Super Admin)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Verify User Role
router.get("/verify", protect, (req, res) => {
  res.json({ name: req.user.name, role: req.user.role });
});

// ✅ Get All Users (Admin & Super Admin Only)
router.get("/users", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const users = await User.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// ✅ Promote/Demote User (Only Super Admin)
router.put("/users/:id/role", protect, async (req, res) => {
  try {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Only Super Admin can change roles" });
    }

    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User role updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
});

// ✅ Delete User (Only Super Admin, Cannot Delete Themselves)
router.delete("/users/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Only Super Admin can delete users" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 Prevent Super Admin from deleting themselves
    if (user.role === "super-admin") {
      return res.status(400).json({ message: "Super Admin cannot delete themselves" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});

export default router;
