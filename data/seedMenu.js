import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../models/Menu.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const sampleMenu = [
  { name: "Zinger Burger", category: "Burgers", price: 350, image: "zinger.jpg", description: "Crispy chicken burger" },
  { name: "Chicken Pizza", category: "Pizza", price: 800, image: "pizza.jpg", description: "Loaded with cheese and chicken" },
];

const seedDB = async () => {
  await Menu.deleteMany({});
  await Menu.insertMany(sampleMenu);
  console.log("Menu Seeded!");
  mongoose.connection.close();
};

seedDB();
