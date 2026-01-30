import express from 'express';
import {
  getAllConstructionMaterials,
  getAllConstructionMaterialsWithoutPagination,
  createConstructionMaterials,
  updateConstructionMaterials,
  deleteConstructionMaterials,
  bulkDeleteConstructionMaterials
} from '../controllers/constructionMaterialsController.js';

const router = express.Router();

router.get('/', getAllConstructionMaterials);
router.get('/all/data', getAllConstructionMaterialsWithoutPagination);
router.post('/', createConstructionMaterials);
router.put('/:id', updateConstructionMaterials);
router.delete('/:id', deleteConstructionMaterials);
router.delete('/bulk-delete', bulkDeleteConstructionMaterials);

export default router;
