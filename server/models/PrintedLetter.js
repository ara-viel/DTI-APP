import mongoose from 'mongoose';

const printedLetterSchema = new mongoose.Schema({
  store: { type: String, required: true, trim: true },
  datePrinted: { type: Date, required: true },
  deadline: { type: Date, required: true },
  replied: { type: Boolean, default: false },
  printedBy: { type: String, default: "", trim: true },
  copiesPrinted: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('PrintedLetter', printedLetterSchema);
