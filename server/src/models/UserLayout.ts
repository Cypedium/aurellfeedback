import mongoose from "mongoose";

const HeaderSchema = new mongoose.Schema({
  key: { type: String, required: true },
  title: { type: String, required: true }
}, { _id: false });

const CardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  content: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

const UserLayoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  cols: { type: Number, default: 12 },

  headers: {
    type: [HeaderSchema],
    default: []
  },

  cards: {
    type: [CardSchema],
    default: []
  }
}, { timestamps: true });

export default mongoose.model("UserLayout", UserLayoutSchema);
