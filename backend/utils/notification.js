import { Notification } from '../models/notification.model.js';

export const createNotification = async({
    recipientId, issueId, type, title, message, status
}) => {
    try {
        const notification = new Notification({
            recipientId,
            issueId,
            type,
            title,
            message,
            status
        });
        await notification.save();
        return notification;
    }
    catch (error) {
        console.error('Error creating notification:', error);
        throw new Error('Failed to create notification');
    }
}