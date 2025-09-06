import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
//   createNotification,
  getUserNotifications,
  markNotificationAsRead,
//   deleteNotification
} from '../controllers/notification.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router=express.Router();

// User Notifications
router.get('/user-notifications/:id', verifyToken, getUserNotifications);
// router.post('/mark-as-read/:id', verifyToken, markNotificationAsRead);

// Ward Admin Notifications
router.get('/admin-notifications/:id', verifyToken, isAdmin, getUserNotifications);
// router.post('/mark-as-read/:id', verifyToken, markNotificationAsRead);

router.get('/:id', verifyToken, getUserNotifications);

router.patch('/mark-as-read/:id', verifyToken, markNotificationAsRead);

export default router;