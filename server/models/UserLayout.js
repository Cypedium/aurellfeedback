import mongoose from "mongoose";

const CardLayoutSchema = new mongoose.Schema({
  id: { type: String, required: true },
  x: Number,
  y: Number,
  w: Number,
  h: Number,
});

const HeaderSchema = new mongoose.Schema({
  key: String,
  title: String,
  x: Number,
  w: Number,
});

const UserLayoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  cols: { type: Number, default: 6 },
  headers: [HeaderSchema],
  cards: [CardLayoutSchema],
});

export default mongoose.model("UserLayout", UserLayoutSchema);

