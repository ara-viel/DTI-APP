import PrintedLetter from '../models/PrintedLetter.js';

export const getAllPrintedLetters = async (req, res) => {
  try {
    const letters = await PrintedLetter.find().sort({ datePrinted: -1 });
    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPrintedLetter = async (req, res) => {
  try {
    const { store, datePrinted, deadline, printedBy, replied, copiesPrinted } = req.body;
    
    if (!store || !datePrinted || !deadline) {
      return res.status(400).json({ error: 'Store, datePrinted, and deadline are required' });
    }

    const newLetter = new PrintedLetter({
      store,
      datePrinted: new Date(datePrinted),
      deadline: new Date(deadline),
      printedBy: printedBy || '',
      replied: !!replied,
      copiesPrinted: typeof copiesPrinted === 'number' ? copiesPrinted : 1
    });

    await newLetter.save();
    console.log(`✅ Printed letter record saved for store: ${store}`);
    res.status(201).json(newLetter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePrintedLetter = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.datePrinted) update.datePrinted = new Date(update.datePrinted);
    if (update.deadline) update.deadline = new Date(update.deadline);

    const updated = await PrintedLetter.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePrintedLetter = async (req, res) => {
  try {
    const deleted = await PrintedLetter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Printed letter record deleted', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
