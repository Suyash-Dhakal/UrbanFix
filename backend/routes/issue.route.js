import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkSimilarity } from '../middleware/checkSimilarity.js';
import {confirmReport} from '../controllers/issue.controller.js';

const router=express.Router();

router.post('/report-issue', verifyToken, checkSimilarity, confirmReport);
router.post('/confirm-report', verifyToken, confirmReport);

export default router;