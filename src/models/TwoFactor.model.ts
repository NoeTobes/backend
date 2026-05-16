import pool from '../config/database';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorModel {
    static async generateSecret(email: string): Promise<{ secret: string; qrCode: string }> {
        const secret = speakeasy.generateSecret({
            name: `AuthMaster (${email})`,
            length: 20
        });
        
        const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
        
        return {
            secret: secret.base32,
            qrCode: qrCode
        };
    }
    
    static async enable2FA(userId: number, secret: string): Promise<boolean> {
        try {
            await pool.query(
                `UPDATE accounts SET twoFactorSecret = ?, twoFactorEnabled = TRUE WHERE id = ?`,
                [secret, userId]
            );
            return true;
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            return false;
        }
    }
    
    static async disable2FA(userId: number): Promise<boolean> {
        try {
            await pool.query(
                `UPDATE accounts SET twoFactorSecret = NULL, twoFactorEnabled = FALSE, backupCodes = NULL WHERE id = ?`,
                [userId]
            );
            return true;
        } catch (error) {
            console.error('Error disabling 2FA:', error);
            return false;
        }
    }
    
    static async verifyToken(userId: number, token: string): Promise<boolean> {
        const [rows] = await pool.query(
            `SELECT twoFactorSecret FROM accounts WHERE id = ? AND twoFactorEnabled = TRUE`,
            [userId]
        );
        
        const account = (rows as any)[0];
        if (!account || !account.twoFactorSecret) {
            return false;
        }
        
        const verified = speakeasy.totp.verify({
            secret: account.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 1
        });
        
        return verified;
    }
    
    static async generateBackupCodes(): Promise<string[]> {
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            codes.push(code);
        }
        return codes;
    }
    
    static async saveBackupCodes(userId: number, codes: string[]): Promise<void> {
        const codesString = JSON.stringify(codes);
        await pool.query(
            `UPDATE accounts SET backupCodes = ? WHERE id = ?`,
            [codesString, userId]
        );
    }
    
    static async getBackupCodes(userId: number): Promise<string[]> {
        const [rows] = await pool.query(
            `SELECT backupCodes FROM accounts WHERE id = ?`,
            [userId]
        );
        
        const account = (rows as any)[0];
        if (!account || !account.backupCodes) {
            return [];
        }
        
        return JSON.parse(account.backupCodes);
    }
    
    static async verifyBackupCode(userId: number, code: string): Promise<boolean> {
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