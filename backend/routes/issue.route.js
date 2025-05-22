import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkSimilarity } from '../middleware/checkSimilarity.js';
import {confirmReport, getUserReportedIssues, getUserStats,
    getWardStats
} from '../controllers/issue.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router=express.Router();

router.post('/report-issue', verifyToken, checkSimilarity, confirmReport);
router.post('/confirm-report', verifyToken, confirmReport);

//User
router.get('/user-reported-issues', verifyToken, getUserReportedIssues);
router.get('/user-stats', verifyToken, getUserStats);

//Admin
router.get('/ward-stats', verifyToken, isAdmin, getWardStats);

export default router;