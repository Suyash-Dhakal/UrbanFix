import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkSimilarity } from '../middleware/checkSimilarity.js';
import {confirmReport, getUserReportedIssues, getUserStats,
getWardStats, getPendingIssues, getVerifiedIssues, getTopReporters, getTopWards,
getAllVerifiedIssues, getWardUsers
} from '../controllers/issue.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router=express.Router();

router.post('/report-issue', verifyToken, checkSimilarity, confirmReport);
router.post('/confirm-report', verifyToken, confirmReport);

//User
router.get('/user-reported-issues', verifyToken, getUserReportedIssues);
router.get('/user-stats', verifyToken, getUserStats);

//Admin
router.get('/admin/ward-stats', verifyToken, isAdmin, getWardStats);
router.get('/admin/pending-verification', verifyToken, isAdmin, getPendingIssues);
router.get('/admin/verified', verifyToken, isAdmin, getVerifiedIssues);
router.get('/admin/ward-users', verifyToken, isAdmin, getWardUsers);

//Common
router.get('/verified-issues', getAllVerifiedIssues);

//top contributors
router.get('/top-reporters', getTopReporters);
router.get('/top-performing-wards', getTopWards);

export default router;