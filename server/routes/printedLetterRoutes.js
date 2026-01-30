import express from 'express';
import {
  getAllPrintedLetters,
  createPrintedLetter,
  updatePrintedLetter,
  deletePrintedLetter
} from '../controllers/printedLetterController.js';

const router = express.Router();

router.get('/', getAllPrintedLetters);
router.post('/', createPrintedLetter);
router.put('/:id', updatePrintedLetter);
router.delete('/:id', deletePrintedLetter);

export default router;
