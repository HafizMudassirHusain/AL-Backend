import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  image: String,
  description: String,
});

export default mongoose.model("Menu", menuSchema);
