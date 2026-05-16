"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogController = void 0;
const ActivityLog_model_1 = require("../models/ActivityLog.model");
class ActivityLogController {
    static async getAll(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const logs = await ActivityLog_model_1.ActivityLogModel.getAll(limit, offset);
            const total = await ActivityLog_model_1.ActivityLogModel.getCount();
            res.json({ logs, total });
        }
        catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).json({ message: 'Failed to fetch logs' });
        }
    }
    static async getRecent(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const logs = await ActivityLog_model_1.ActivityLogModel.getRecent(limit);
            res.json(logs);
        }
        catch (error) {
            console.error('Error fetching recent logs:', error);
            res.status(500).json({ message: 'Failed to fetch recent logs' });
        }
    }
    static async getByUser(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const logs = await ActivityLog_model_1.ActivityLogModel.getByUser(userId);
            res.json(logs);
        }
        catch (error) {
            console.error('Error fetching user logs:', error);
            res.status(500).json({ message: 'Failed to fetch user logs' });
        }
    }
    static async getActions(req, res) {
        try {
            const actions = ['LOGIN', 'LOGOUT', 'REGISTER', 'USER_CREATED', 'USER_UPDATED',
                'USER_DELETED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED',
                'ROLE_CHANGED', 'EMAIL_VERIFIED', 'PROFILE_PICTURE_UPDATED',
                'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET'];
            res.json(actions);
        }
        catch (error) {
            console.error('Error fetching actions:', error);
            res.status(500).json({ message: 'Failed to fetch actions' });
        }
    }
    static async clearOldLogs(req, res) {
        try {
            const days = parseInt(req.body.days) || 30;
            await ActivityLog_model_1.ActivityLogModel.clearOldLogs(days);
            res.json({ message: `Cleared logs older than ${days} days` });
        }
        catch (error) {
            console.error('Error clearing logs:', error);
            res.status(500).json({ message: 'Failed to clear logs' });
        }
    }
}
exports.ActivityLogController = ActivityLogController;
