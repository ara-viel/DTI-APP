import PrimeCommodities from '../models/PrimeCommodities.js';

export const getAllPrimeCommodities = async (req, res) => {
  try {
    // If pagination params are provided, use pagination
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        PrimeCommodities.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        PrimeCommodities.countDocuments()
      ]);

      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // If no pagination params, return all data as array (for backward compatibility)
      const data = await PrimeCommodities.find().sort({ timestamp: -1 }).lean();
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPrimeCommoditiesWithoutPagination = async (req, res) => {
  try {
    const data = await PrimeCommodities.find().sort({ timestamp: -1 }).lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPrimeCommodities = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.commodity) payload.commodity = 'Unknown';
    if (typeof payload.price !== 'number' || payload.price === null) payload.price = 0;
    if (!payload.brand) payload.brand = 'PRIME COMMODITIES';
    if (!payload.month) payload.month = '';
    if (!payload.years) payload.years = new Date().getFullYear().toString();
    if (!payload.size) payload.size = '';
    if (!payload.store) payload.store = '';
    if (!payload.variant) payload.variant = '';
    if (!payload.timestamp) payload.timestamp = new Date();
    payload.category = 'prime';

    const newRecord = new PrimeCommodities(payload);
    await newRecord.save();
    console.log(`✅ Prime Commodities record saved`);
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePrimeCommodities = async (req, res) => {
  try {
    const update = { ...req.body };
    if (!update.timestamp) update.timestamp = new Date();

    const updated = await PrimeCommodities.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePrimeCommodities = async (req, res) => {
  try {
    const deleted = await PrimeCommodities.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkDeletePrimeCommodities = async (req, res) => {
  try {
    const result = await PrimeCommodities.deleteMany({});
    res.json({ message: 'All Prime Commodities deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
