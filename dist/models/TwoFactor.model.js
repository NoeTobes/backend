"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
class TwoFactorModel {
    static async generateSecret(email) {
        const secret = speakeasy_1.default.generateSecret({
            name: `AuthMaster (${email})`,
            length: 20
        });
        const qrCode = await qrcode_1.default.toDataURL(secret.otpauth_url);
        return {
            secret: secret.base32,
            qrCode: qrCode
        };
    }
    static async enable2FA(userId, secret) {
        try {
            await database_1.default.query(`UPDATE accounts SET twoFactorSecret = ?, twoFactorEnabled = TRUE WHERE id = ?`, [secret, userId]);
            return true;
        }
        catch (error) {
            console.error('Error enabling 2FA:', error);
            return false;
        }
    }
    static async disable2FA(userId) {
        try {
            await database_1.default.query(`UPDATE accounts SET twoFactorSecret = NULL, twoFactorEnabled = FALSE, backupCodes = NULL WHERE id = ?`, [userId]);
            return true;
        }
        catch (error) {
            console.error('Error disabling 2FA:', error);
            return false;
        }
    }
    static async verifyToken(userId, token) {
        const [rows] = await database_1.default.query(`SELECT twoFactorSecret FROM accounts WHERE id = ? AND twoFactorEnabled = TRUE`, [userId]);
        const account = rows[0];
        if (!account || !account.twoFactorSecret) {
            return false;
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: account.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 1
        });
        return verified;
    }
    static async generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            codes.push(code);
        }
        return codes;
    }
    static async saveBackupCodes(userId, codes) {
        const codesString = JSON.stringify(codes);
        await database_1.default.query(`UPDATE accounts SET backupCodes = ? WHERE id = ?`, [codesString, userId]);
    }
    static async getBackupCodes(userId) {
        const [rows] = await database_1.default.query(`SELECT backupCodes FROM accounts WHERE id = ?`, [userId]);
        const account = rows[0];
        if (!account || !account.backupCodes) {
            return [];
        }
        return JSON.parse(account.backupCodes);
    }
    static async verifyBackupCode(userId, code) {
        const codes = await this.getBackupCodes(userId);
        const index = codes.indexOf(code);
        if (index !== -1) {
            codes.splice(index, 1);
            await this.saveBackupCodes(userId, codes);
            return true;
        }
        return false;
    }
}
exports.TwoFactorModel = TwoFactorModel;
