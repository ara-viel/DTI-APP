import express from 'express';
import {
  getAllPrimeCommodities,
  getAllPrimeCommoditiesWithoutPagination,
  createPrimeCommodities,
  updatePrimeCommodities,
  deletePrimeCommodities,
  bulkDeletePrimeCommodities
} from '../controllers/primeCommoditiesController.js';

const router = express.Router();

router.get('/', getAllPrimeCommodities);
router.get('/all/data', getAllPrimeCommoditiesWithoutPagination);
router.post('/', createPrimeCommodities);
router.put('/:id', updatePrimeCommodities);
router.delete('/:id', deletePrimeCommodities);
router.delete('/bulk-delete', bulkDeletePrimeCommodities);

export default router;
