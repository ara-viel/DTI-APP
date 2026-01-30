import PriceData from '../models/PriceData.js';

export const getAllPrices = async (req, res) => {
  try {
    // If pagination params are provided, use pagination
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [prices, total] = await Promise.all([
        PriceData.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        PriceData.countDocuments()
      ]);

      res.json({
        data: prices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // If no pagination params, return all data as array (for backward compatibility)
      const prices = await PriceData.find().sort({ timestamp: -1 }).lean();
      res.json(prices);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPricesWithoutPagination = async (req, res) => {
  try {
    const prices = await PriceData.find().sort({ timestamp: -1 }).lean();
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPrice = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.commodity) payload.commodity = 'Unknown';
    if (typeof payload.price !== 'number' || payload.price === null) payload.price = 0;
    if (!payload.brand) payload.brand = '';
    if (!payload.month) payload.month = '';
    if (!payload.years) payload.years = new Date().getFullYear().toString();
    if (!payload.size) payload.size = '';
    if (!payload.store) payload.store = '';
    if (!payload.variant) payload.variant = '';
    if (!payload.category) payload.category = '';
    if (!payload.timestamp) payload.timestamp = new Date();

    const newPrice = new PriceData(payload);
    await newPrice.save();
    res.status(201).json(newPrice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePrice = async (req, res) => {
  try {
    const update = { ...req.body };
    if (!update.category) update.category = '';
    if (!update.timestamp) update.timestamp = new Date();

    const updated = await PriceData.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePrice = async (req, res) => {
  try {
    const deleted = await PriceData.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkDeletePrices = async (req, res) => {
  try {
    const result = await PriceData.deleteMany({});
    res.json({ message: 'All price data deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
