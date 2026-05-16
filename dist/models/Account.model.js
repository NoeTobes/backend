"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_service_1 = require("../utils/jwt.service");
const crypto_1 = __importDefault(require("crypto"));
class AccountModel {
    static async create(userData) {
        const { title, firstName, lastName, email, password } = userData;
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        console.log('Generated verification token:', verificationToken);
        const [rows] = await database_1.default.query('SELECT COUNT(*) as count FROM accounts');
        const isFirstAccount = rows[0].count === 0;
        const role = isFirstAccount ? 'Admin' : 'User';
        const [result] = await database_1.default.query(`INSERT INTO accounts 
         (title, firstName, lastName, email, passwordHash, role, isVerified, verificationToken, twoFactorEnabled) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, firstName, lastName, email, passwordHash, role, false, verificationToken, false]);
        const insertId = result.insertId;
        const account = await this.getById(insertId);
        return {
            ...account,
            verificationToken: verificationToken,
            twoFactorEnabled: false
        };
    }
    static async getById(id) {
        const [rows] = await database_1.default.query('SELECT id, title, firstName, lastName, email, role, isVerified, createdAt, profilePicture, twoFactorEnabled FROM accounts WHERE id = ?', [id]);
        return rows[0];
    }
    static async getByEmail(email) {
        const [rows] = await database_1.default.query(`SELECT id, title, firstName, lastName, email, passwordHash, role, isVerified, 
                verificationToken, resetToken, resetTokenExpires, refreshToken, 
                profilePicture, twoFactorSecret, twoFactorEnabled, backupCodes 
         FROM accounts WHERE email = ?`, [email]);
        return rows[0] || null;
    }
    static async getByVerificationToken(token) {
        const [rows] = await database_1.default.query('SELECT * FROM accounts WHERE verificationToken = ? AND isVerified = false', [token]);
        return rows[0] || null;
    }
    static async getByResetToken(token) {
        const [rows] = await database_1.default.query('SELECT * FROM accounts WHERE resetToken = ? AND resetTokenExpires > NOW()', [token]);
        return rows[0] || null;
    }
    static async verifyEmail(token) {
        const [result] = await database_1.default.query(`UPDATE accounts 
             SET isVerified = true, verificationToken = NULL 
             WHERE verificationToken = ? AND isVerified = false`, [token]);
        return result.affectedRows > 0;
    }
    static async updateRefreshToken(accountId, refreshToken) {
        await database_1.default.query('UPDATE accounts SET refreshToken = ? WHERE id = ?', [refreshToken, accountId]);
    }
    static async createResetToken(email) {
        const account = await this.getByEmail(email);
        if (!account)
            return null;
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
        await database_1.default.query('UPDATE accounts SET resetToken = ?, resetTokenExpires = ? WHERE id = ?', [resetToken, resetTokenExpires, account.id]);
        return resetToken;
    }
    static async resetPassword(token, newPassword) {
        const account = await this.getByResetToken(token);
        if (!account)
            return false;
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        const [result] = await database_1.default.query('UPDATE accounts SET passwordHash = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?', [passwordHash, account.id]);
        return result.affectedRows > 0;
    }
    static async authenticate(email, password) {
        const account = await this.getByEmail(email);
        if (!account || !account.isVerified)
            return null;
        const isValid = await bcryptjs_1.default.compare(password, account.passwordHash);
        if (!isValid)
            return null;
        const accessToken = (0, jwt_service_1.generateAccessToken)({
            id: account.id,
            email: account.email,
            role: account.role
        });
        const refreshToken = (0, jwt_service_1.generateRefreshToken)({
            id: account.id,
            email: account.email,
            role: account.role
        });
        await this.updateRefreshToken(account.id, refreshToken);
        const accountResponse = await this.getById(account.id);
        return { account: accountResponse, accessToken, refreshToken };
    }
    static async refreshToken(refreshToken) {
        try {
            const payload = (0, jwt_service_1.verifyRefreshToken)(refreshToken);
            const [rows] = await database_1.default.query('SELECT * FROM accounts WHERE id = ? AND refreshToken = ?', [payload.id, refreshToken]);
            const account = rows[0];
            if (!account)
                return null;
            const newAccessToken = (0, jwt_service_1.generateAccessToken)({
                id: account.id,
                email: account.email,
                role: account.role
            });
            const newRefreshToken = (0, jwt_service_1.generateRefreshToken)({
                id: account.id,
                email: account.email,
                role: account.role
            });
            await this.updateRefreshToken(account.id, newRefreshToken);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            return null;
        }
    }
    static async revokeRefreshToken(accountId) {
        await this.updateRefreshToken(accountId, null);
    }
    static async getAll() {
        const [rows] = await database_1.default.query('SELECT id, title, firstName, lastName, email, role, isVerified, createdAt, profilePicture FROM accounts ORDER BY id');
        return rows;
    }
    static async update(id, data) {
        const fields = [];
        const values = [];
        if (data.title) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.firstName) {
            fields.push('firstName = ?');
            values.push(data.firstName);
        }
        if (data.lastName) {
            fields.push('lastName = ?');
            values.push(data.lastName);
        }
        if (data.email) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.password) {
            const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
            fields.push('passwordHash = ?');
            values.push(passwordHash);
        }
        if (data.role) {
            fields.push('role = ?');
            values.push(data.role);
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        await database_1.default.query(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.getById(id);
    }
    static async delete(id) {
        const [result] = await database_1.default.query('DELETE FROM accounts WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}
exports.AccountModel = AccountModel;
