import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkSimilarity } from '../middleware/checkSimilarity.js';
import {confirmReport, getUserReportedIssues, getUserStats,
getWardStats, getPendingIssues, getVerifiedIssues, getTopReporters, getTopWards,
getAllVerifiedIssues, getWardUsers, getAnalyticsByRange, getReports, getReportById,
verifyIssue, cancelIssue, resolveIssue, getMyReports
} from '../controllers/issue.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router=express.Router();

router.post('/report-issue', verifyToken, checkSimilarity, confirmReport);
router.post('/confirm-report', verifyToken, confirmReport);

//User
router.get('/user-reported-issues', verifyToken, getUserReportedIssues);
router.get('/user-stats', verifyToken, getUserStats);
router.get('/my-reports', verifyToken, getMyReports);

//Admin
router.get('/admin/ward-stats', verifyToken, isAdmin, getWardStats);
router.get('/admin/pending-verification', verifyToken, isAdmin, getPendingIssues);
router.get('/admin/verified', verifyToken, isAdmin, getVerifiedIssues);
router.get('/admin/ward-users', verifyToken, isAdmin, getWardUsers);
// the below needs to be changed it's temp since we are sending id from the req.body not using params
router.post('/admin/verify-issue', verifyToken, isAdmin, verifyIssue);
router.post('/admin/reject-issue', verifyToken, isAdmin, cancelIssue);
router.post('/admin/resolve-issue', verifyToken, isAdmin, resolveIssue);

//Common
router.get('/verified-issues', getAllVerifiedIssues);
router.get('/analytics', verifyToken, isAdmin, getAnalyticsByRange);

//top contributors
router.get('/top-reporters', getTopReporters);
router.get('/top-performing-wards', getTopWards);

router.get('/reports', getReports);
router.get('/report/:id', getReportById);

export default router;