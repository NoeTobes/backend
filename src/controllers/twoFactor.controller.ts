import { Request, Response } from 'express';
import { TwoFactorModel } from '../models/TwoFactor.model';
import { ActivityLogModel } from '../models/ActivityLog.model';
import speakeasy from 'speakeasy';
import pool from '../config/database';

export class TwoFactorController {
    static async setup(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const email = (req as any).user.email;
            
            const { secret, qrCode } = await TwoFactorModel.generateSecret(email);
            
            res.json({
                secret: secret,
                qrCode: qrCode
            });
        } catch (error) {
            console.error('2FA setup error:', error);
            res.status(500).json({ message: 'Failed to setup 2FA' });
        }
    }
    
    static async enable(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const userEmail = (req as any).user.email;
            const { secret, token } = req.body;
            
            // Verify token
            const isValid = speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 1
            });
            
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }
            
            // Enable 2FA
            const success = await TwoFactorModel.enable2FA(userId, secret);
            
            if (!success) {
                return res.status(500).json({ message: 'Failed to enable 2FA' });
            }
            
            // Generate backup codes
            const backupCodes = await TwoFactorModel.generateBackupCodes();
            await TwoFactorModel.saveBackupCodes(userId, backupCodes);
            
            // Log activity
            await ActivityLogModel.log(userId, userEmail, '2FA_ENABLED', 'Two-factor authentication enabled', req);
            
            res.json({
                message: '2FA enabled successfully',
                backupCodes: backupCodes
            });
        } catch (error) {
            console.error('2FA enable error:', error);
            res.status(500).json({ message: 'Failed to enable 2FA' });
        }
    }
    
    static async disable(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const userEmail = (req as any).user.email;
            const { token } = req.body;
            
            // Verify token before disabling
            const isValid = await TwoFactorModel.verifyToken(userId, token);
            
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }
            
            const success = await TwoFactorModel.disable2FA(userId);
            
            if (!success) {
                return res.status(500).json({ message: 'Failed to disable 2FA' });
            }
            
            // Log activity
            await ActivityLogModel.log(userId, userEmail, '2FA_DISABLED', 'Two-factor authentication disabled', req);
            
            res.json({ message: '2FA disabled successfully' });
        } catch (error) {
            console.error('2FA disable error:', error);
            res.status(500).json({ message: 'Failed to disable 2FA' });
        }
    }
    
    static async verify(req: Request, res: Response) {
        try {
            const { userId, token } = req.body;
            
            const isValid = await TwoFactorModel.verifyToken(userId, token);
            
            if (!isValid) {
                const isValidBackup = await TwoFactorModel.verifyBackupCode(userId, token);
                if (!isValidBackup) {
                    return res.status(401).json({ message: 'Invalid verification code', valid: false });
                }
            }
            
            res.json({ valid: true });
        } catch (error) {
            console.error('2FA verify error:', error);
            res.status(500).json({ message: 'Verification failed', valid: false });
        }
    }
    
    static async getStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const [rows] = await pool.query(
                `SELECT twoFactorEnabled FROM accounts WHERE id = ?`,
                [userId]
            );
            const account = (rows as any)[0];
            res.json({ enabled: account?.twoFactorEnabled || false });
        } catch (error) {
            console.error('Get 2FA status error:', error);
            res.status(500).json({ message: 'Failed to get 2FA status' });
        }
    }
}