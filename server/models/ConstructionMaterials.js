import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  brand: { type: String, default: "", trim: true },
  commodity: { type: String, required: true, trim: true },
  month: { type: String, default: "", trim: true },
  price: { type: Number, required: true, default: 0 },
  srp: { type: mongoose.Schema.Types.Mixed, default: "" },
  size: { type: String, default: "", trim: true },
  store: { type: String, default: "", trim: true },
  variant: { type: String, default: "", trim: true },
  category: { type: String, default: "", trim: true },
  years: { type: String, default: "", trim: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('ConstructionMaterials', priceSchema);
