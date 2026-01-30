import mongoose from 'mongoose';
import BasicNecessities from '../models/BasicNecessities.js';
import PrimeCommodities from '../models/PrimeCommodities.js';
import ConstructionMaterials from '../models/ConstructionMaterials.js';
import PriceData from '../models/PriceData.js';

export const deleteAllData = async (req, res) => {
  try {
    const results = await Promise.all([
      BasicNecessities.deleteMany({}),
      PrimeCommodities.deleteMany({}),
      ConstructionMaterials.deleteMany({}),
      PriceData.deleteMany({})
    ]);
    
    const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);
    
    res.json({ 
      message: 'All data deleted from all collections',
      totalDeleted,
      details: {
        basicNecessities: results[0].deletedCount,
        primeCommodities: results[1].deletedCount,
        constructionMaterials: results[2].deletedCount,
        priceData: results[3].deletedCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const migrateSchema = async (req, res) => {
  try {
    const collection = mongoose.connection.collection('pricedatas');
    const currentYear = new Date().getFullYear();
    const defaultYear = currentYear > 2025 ? currentYear.toString() : '2025';

    const result = await collection.updateMany(
      {},
      [
        {
          $set: {
            brand: { $ifNull: ['$brand', ''] },
            commodity: { $ifNull: ['$commodity', 'Unknown'] },
            month: { $ifNull: ['$month', ''] },
            price: { $ifNull: ['$price', 0] },
            size: { $ifNull: ['$size', ''] },
            store: { $ifNull: ['$store', ''] },
            variant: { $ifNull: ['$variant', ''] },
            years: { $ifNull: ['$years', defaultYear] },
            category: { $ifNull: ['$category', ''] }
          }
        },
        {
          $unset: ['prevPrice', 'municipality', 'srp']
        }
      ]
    );

    res.json({
      message: 'Migration completed',
      matched: result.matchedCount,
      modified: result.modifiedCount,
      summary: {
        added: ['brand', 'commodity', 'month', 'price', 'size', 'store', 'variant', 'years', 'category'],
        removed: ['prevPrice', 'municipality', 'srp']
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
