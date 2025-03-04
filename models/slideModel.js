import mongoose from "mongoose";

const slideSchema = new mongoose.Schema({
  text: { type: String, required: true },
  subtext: { type: String, required: true },
  image: { type: String, required: false }, // URL for the image
});

const Slide = mongoose.model("Slide", slideSchema);
export default Slide;
