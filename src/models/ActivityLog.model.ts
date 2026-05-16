import pool from '../config/database';

export interface ActivityLog {
    id: number;
    user_id: number;
    user_email: string;
    action: string;
    details: string;
    ip_address: string;
    user_agent: string;
    created_at: Date;
}

export class ActivityLogModel {
    static async log(userId: number, userEmail: string, action: string, details: string = '', req?: any) {
        const ip_address = req?.ip || req?.connection?.remoteAddress || 'unknown';
        const user_agent = req?.headers?.['user-agent'] || 'unknown';
        
        try {
            const [result] = await pool.query(
                `INSERT INTO activity_logs (user_id, user_email, action, details, ip_address, user_agent) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, userEmail, action, details, ip_address, user_agent]
            );
            console.log(`Activity logged: ${action} for user ${userEmail}`);
            return result;
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
    
    static async getAll(limit: number = 100, offset: number = 0): Promise<ActivityLog[]> {
        const [rows] = await pool.query(
            `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows as ActivityLog[];
    }
    
    static async getByUser(userId: number, limit: number = 50): Promise<ActivityLog[]> {
        const [rows] = await pool.query(
            `SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
            [userId, limit]
        );
        return rows as ActivityLog[];
    }
    
    static async getCount(): Promise<number> {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM activity_logs`);
        return (rows as any)[0].count;
    }
    
    static async getRecent(limit: number = 20): Promise<ActivityLog[]> {
        const [rows] = await pool.query(
            `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?`,
            [limit]
        );
        return rows as ActivityLog[];
    }
    
    static async clearOldLogs(days: number = 30): Promise<void> {
        const [result] = await pool.query(
            `DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );
        console.log(`Cleared ${(result as any).affectedRows} old activity logs`);
    }
}