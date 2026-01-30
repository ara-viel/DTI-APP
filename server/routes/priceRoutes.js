import express from 'express';
import {
  getAllPrices,
  getAllPricesWithoutPagination,
  createPrice,
  updatePrice,
  deletePrice,
  bulkDeletePrices
} from '../controllers/priceController.js';

const router = express.Router();

router.get('/', getAllPrices);
router.get('/all/data', getAllPricesWithoutPagination);
router.post('/', createPrice);
router.put('/:id', updatePrice);
router.delete('/:id', deletePrice);
router.delete('/bulk-delete', bulkDeletePrices);

export default router;
