import { Notification } from '../models/notification.model.js';

export const getUserNotifications = async (req, res) => {

    const {id}= req.params;
    
    try {
        const notifications = await Notification.find({ recipientId: id }).sort({ createdAt: -1 });
        const total = notifications.length;
        const unread= notifications.filter(n => n.status === 'unread').length;
        if(!notifications || notifications.length === 0) {
            return res.status(200).json({ success: true, message: 'No notifications found',notifications:[], user: id });
        }
        res.status(200).json({ success: true, notifications, total, unread });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
}

export const markNotificationAsRead = async (req, res)=>{
    const {id}= req.params; // notification id from params
    try {
        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        notification.status = 'read';
        await notification.save();
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
}