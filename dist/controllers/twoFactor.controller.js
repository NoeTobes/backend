"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorController = void 0;
const TwoFactor_model_1 = require("../models/TwoFactor.model");
const ActivityLog_model_1 = require("../models/ActivityLog.model");
const speakeasy_1 = __importDefault(require("speakeasy"));
const database_1 = __importDefault(require("../config/database"));
class TwoFactorController {
    static async setup(req, res) {
        try {
            const userId = req.user.id;
            const email = req.user.email;
            const { secret, qrCode } = await TwoFactor_model_1.TwoFactorModel.generateSecret(email);
            res.json({
                secret: secret,
                qrCode: qrCode
            });
        }
        catch (error) {
            console.error('2FA setup error:', error);
            res.status(500).json({ message: 'Failed to setup 2FA' });
        }
    }
    static async enable(req, res) {
        try {
            const userId = req.user.id;
            const userEmail = req.user.email;
            const { secret, token } = req.body;
            // Verify token
            const isValid = speakeasy_1.default.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 1
            });
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }
            // Enable 2FA
            const success = await TwoFactor_model_1.TwoFactorModel.enable2FA(userId, secret);
            if (!success) {
                return res.status(500).json({ message: 'Failed to enable 2FA' });
            }
            // Generate backup codes
            const backupCodes = await TwoFactor_model_1.TwoFactorModel.generateBackupCodes();
            await TwoFactor_model_1.TwoFactorModel.saveBackupCodes(userId, backupCodes);
            // Log activity
            await ActivityLog_model_1.ActivityLogModel.log(userId, userEmail, '2FA_ENABLED', 'Two-factor authentication enabled', req);
            res.json({
                message: '2FA enabled successfully',
                backupCodes: backupCodes
            });
        }
        catch (error) {
            console.error('2FA enable error:', error);
            res.status(500).json({ message: 'Failed to enable 2FA' });
        }
    }
    static async disable(req, res) {
        try {
            const userId = req.user.id;
            const userEmail = req.user.email;
            const { token } = req.body;
            // Verify token before disabling
            const isValid = await TwoFactor_model_1.TwoFactorModel.verifyToken(userId, token);
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }
            const success = await TwoFactor_model_1.TwoFactorModel.disable2FA(userId);
            if (!success) {
                return res.status(500).json({ message: 'Failed to disable 2FA' });
            }
            // Log activity
            await ActivityLog_model_1.ActivityLogModel.log(userId, userEmail, '2FA_DISABLED', 'Two-factor authentication disabled', req);
            res.json({ message: '2FA disabled successfully' });
        }
        catch (error) {
            console.error('2FA disable error:', error);
            res.status(500).json({ message: 'Failed to disable 2FA' });
        }
    }
    static async verify(req, res) {
        try {
            const { userId, token } = req.body;
            const isValid = await TwoFactor_model_1.TwoFactorModel.verifyToken(userId, token);
            if (!isValid) {
                const isValidBackup = await TwoFactor_model_1.TwoFactorModel.verifyBackupCode(userId, token);
                if (!isValidBackup) {
                    return res.status(401).json({ message: 'Invalid verification code', valid: false });
                }
            }
            res.json({ valid: true });
        }
        catch (error) {
            console.error('2FA verify error:', error);
            res.status(500).json({ message: 'Verification failed', valid: false });
        }
    }
    static async getStatus(req, res) {
        try {
            const userId = req.user.id;
            const [rows] = await database_1.default.query(`SELECT twoFactorEnabled FROM accounts WHERE id = ?`, [userId]);
            const account = rows[0];
            res.json({ enabled: account?.twoFactorEnabled || false });
        }
        catch (error) {
            console.error('Get 2FA status error:', error);
            res.status(500).json({ message: 'Failed to get 2FA status' });
        }
    }
}
exports.TwoFactorController = TwoFactorController;
