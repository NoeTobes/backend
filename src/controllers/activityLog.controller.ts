import { Request, Response } from 'express';
import { ActivityLogModel } from '../models/ActivityLog.model';

export class ActivityLogController {
    static async getAll(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;
            const logs = await ActivityLogModel.getAll(limit, offset);
            const total = await ActivityLogModel.getCount();
            res.json({ logs, total });
        } catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).json({ message: 'Failed to fetch logs' });
        }
    }
    
    static async getRecent(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const logs = await ActivityLogModel.getRecent(limit);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching recent logs:', error);
            res.status(500).json({ message: 'Failed to fetch recent logs' });
        }
    }
    
    static async getByUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            const logs = await ActivityLogModel.getByUser(userId);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching user logs:', error);
            res.status(500).json({ message: 'Failed to fetch user logs' });
        }
    }
    
    static async getActions(req: Request, res: Response) {
        try {
            const actions = ['LOGIN', 'LOGOUT', 'REGISTER', 'USER_CREATED', 'USER_UPDATED', 
                           'USER_DELETED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 
                           'ROLE_CHANGED', 'EMAIL_VERIFIED', 'PROFILE_PICTURE_UPDATED',
                           'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET'];
            res.json(actions);
        } catch (error) {
            console.error('Error fetching actions:', error);
            res.status(500).json({ message: 'Failed to fetch actions' });
        }
    }
    
    static async clearOldLogs(req: Request, res: Response) {
        try {
            const days = parseInt(req.body.days) || 30;
            await ActivityLogModel.clearOldLogs(days);
            res.json({ message: `Cleared logs older than ${days} days` });
        } catch (error) {
            console.error('Error clearing logs:', error);
            res.status(500).json({ message: 'Failed to clear logs' });
        }
    }
}