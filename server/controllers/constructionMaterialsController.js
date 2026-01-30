import ConstructionMaterials from '../models/ConstructionMaterials.js';

export const getAllConstructionMaterials = async (req, res) => {
  try {
    // If pagination params are provided, use pagination
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        ConstructionMaterials.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
        ConstructionMaterials.countDocuments()
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
      const data = await ConstructionMaterials.find().sort({ timestamp: -1 }).lean();
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllConstructionMaterialsWithoutPagination = async (req, res) => {
  try {
    const data = await ConstructionMaterials.find().sort({ timestamp: -1 }).lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createConstructionMaterials = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.commodity) payload.commodity = 'Unknown';
    if (typeof payload.price !== 'number' || payload.price === null) payload.price = 0;
    if (!payload.brand) payload.brand = 'CONSTRUCTION MATERIALS';
    if (!payload.month) payload.month = '';
    if (!payload.years) payload.years = new Date().getFullYear().toString();
    if (!payload.size) payload.size = '';
    if (!payload.store) payload.store = '';
    if (!payload.variant) payload.variant = '';
    if (!payload.timestamp) payload.timestamp = new Date();
    payload.category = 'construction';

    const newRecord = new ConstructionMaterials(payload);
    await newRecord.save();
    console.log(`✅ Construction Materials record saved`);
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateConstructionMaterials = async (req, res) => {
  try {
    const update = { ...req.body };
    if (!update.timestamp) update.timestamp = new Date();

    const updated = await ConstructionMaterials.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteConstructionMaterials = async (req, res) => {
  try {
    const deleted = await ConstructionMaterials.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkDeleteConstructionMaterials = async (req, res) => {
  try {
    const result = await ConstructionMaterials.deleteMany({});
    res.json({ message: 'All Construction Materials deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
