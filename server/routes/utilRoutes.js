import express from 'express';
import { deleteAllData, migrateSchema } from '../controllers/utilController.js';

const router = express.Router();

router.delete('/delete-all', deleteAllData);
router.post('/migrate', migrateSchema);

export default router;
