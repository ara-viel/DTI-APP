import BasicNecessities from '../models/BasicNecessities.js';

export const getAllBasicNecessities = async (req, res) => {
  try {
    // If pagination params are provided, use pagination
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        BasicNecessities.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        BasicNecessities.countDocuments()
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
      const data = await BasicNecessities.find().sort({ timestamp: -1 }).lean();
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllBasicNecessitiesWithoutPagination = async (req, res) => {
  try {
    const data = await BasicNecessities.find().sort({ timestamp: -1 }).lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBasicNecessities = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.commodity) payload.commodity = 'Unknown';
    if (typeof payload.price !== 'number' || payload.price === null) payload.price = 0;
    if (!payload.brand) payload.brand = 'BASIC NECESSITIES';
    if (!payload.month) payload.month = '';
    if (!payload.years) payload.years = new Date().getFullYear().toString();
    if (!payload.size) payload.size = '';
    if (!payload.store) payload.store = '';
    if (!payload.variant) payload.variant = '';
    if (!payload.timestamp) payload.timestamp = new Date();
    payload.category = 'basic';

    const newRecord = new BasicNecessities(payload);
    await newRecord.save();
    console.log(`✅ Basic Necessities record saved`);
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateBasicNecessities = async (req, res) => {
  try {
    const update = { ...req.body };
    if (!update.timestamp) update.timestamp = new Date();

    const updated = await BasicNecessities.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBasicNecessities = async (req, res) => {
  try {
    const deleted = await BasicNecessities.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkDeleteBasicNecessities = async (req, res) => {
  try {
    const result = await BasicNecessities.deleteMany({});
    res.json({ message: 'All Basic Necessities deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
