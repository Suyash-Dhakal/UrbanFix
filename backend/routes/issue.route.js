import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {confirmReport, reportIssue} from '../controllers/issue.controller.js';

const router=express.Router();

// router.post('/report-issue', verifyToken, checkSimilarity, reportIssue);
router.post('/confirm-report', verifyToken, confirmReport);

export default router;