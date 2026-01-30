import express from 'express';
import {
  getAllBasicNecessities,
  getAllBasicNecessitiesWithoutPagination,
  createBasicNecessities,
  updateBasicNecessities,
  deleteBasicNecessities,
  bulkDeleteBasicNecessities
} from '../controllers/basicNecessitiesController.js';

const router = express.Router();

router.get('/', getAllBasicNecessities);
router.get('/all/data', getAllBasicNecessitiesWithoutPagination);
router.post('/', createBasicNecessities);
router.put('/:id', updateBasicNecessities);
router.delete('/:id', deleteBasicNecessities);
router.delete('/bulk-delete', bulkDeleteBasicNecessities);

export default router;
