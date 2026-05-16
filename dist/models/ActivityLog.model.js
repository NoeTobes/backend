"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ActivityLogModel {
    static async log(userId, userEmail, action, details = '', req) {
        const ip_address = req?.ip || req?.connection?.remoteAddress || 'unknown';
        const user_agent = req?.headers?.['user-agent'] || 'unknown';
        try {
            const [result] = await database_1.default.query(`INSERT INTO activity_logs (user_id, user_email, action, details, ip_address, user_agent) 
                 VALUES (?, ?, ?, ?, ?, ?)`, [userId, userEmail, action, details, ip_address, user_agent]);
            console.log(`Activity logged: ${action} for user ${userEmail}`);
            return result;
        }
        catch (error) {
            console.error('Error logging activity:', error);
        }
    }
    static async getAll(limit = 100, offset = 0) {
        const [rows] = await database_1.default.query(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`, [limit, offset]);
        return rows;
    }
    static async getByUser(userId, limit = 50) {
        const [rows] = await database_1.default.query(`SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, [userId, limit]);
        return rows;
    }
    static async getCount() {
        const [rows] = await database_1.default.query(`SELECT COUNT(*) as count FROM activity_logs`);
        return rows[0].count;
    }
    static async getRecent(limit = 20) {
        const [rows] = await database_1.default.query(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?`, [limit]);
        return rows;
    }
    static async clearOldLogs(days = 30) {
        const [result] = await database_1.default.query(`DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`, [days]);
        console.log(`Cleared ${result.affectedRows} old activity logs`);
    }
}
exports.ActivityLogModel = ActivityLogModel;
