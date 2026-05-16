import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { Account, AccountResponse, RegisterRequest } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.service';
import crypto from 'crypto';

export class AccountModel {
    static async create(userData: RegisterRequest): Promise<any> {
        const { title, firstName, lastName, email, password } = userData;
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        console.log('Generated verification token:', verificationToken);
        
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM accounts');
        const isFirstAccount = (rows as any)[0].count === 0;
        const role = isFirstAccount ? 'Admin' : 'User';
        
        const [result] = await pool.query(
            `INSERT INTO accounts 
             (title, firstName, lastName, email, passwordHash, role, isVerified, verificationToken, twoFactorEnabled) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, firstName, lastName, email, passwordHash, role, false, verificationToken, false]
        );
        
        const insertId = (result as any).insertId;
        const account = await this.getById(insertId);
        
        return {
            ...account,
            verificationToken: verificationToken,
            twoFactorEnabled: false
        };
    }
    
    static async getById(id: number): Promise<AccountResponse> {
        const [rows] = await pool.query(
            'SELECT id, title, firstName, lastName, email, role, isVerified, createdAt, profilePicture, twoFactorEnabled FROM accounts WHERE id = ?',
            [id]
        );
        return (rows as any)[0];
    }
    
    static async getByEmail(email: string): Promise<any> {
        const [rows] = await pool.query(
            `SELECT id, title, firstName, lastName, email, passwordHash, role, isVerified, 
                    verificationToken, resetToken, resetTokenExpires, refreshToken, 
                    profilePicture, twoFactorSecret, twoFactorEnabled, backupCodes 
             FROM accounts WHERE email = ?`,
            [email]
        );
        return (rows as any)[0] || null;
    }
    
    static async getByVerificationToken(token: string): Promise<Account | null> {
        const [rows] = await pool.query(
            'SELECT * FROM accounts WHERE verificationToken = ? AND isVerified = false',
            [token]
        );
        return (rows as any)[0] || null;
    }
    
    static async getByResetToken(token: string): Promise<Account | null> {
        const [rows] = await pool.query(
            'SELECT * FROM accounts WHERE resetToken = ? AND resetTokenExpires > NOW()',
            [token]
        );
        return (rows as any)[0] || null;
    }
    
    static async verifyEmail(token: string): Promise<boolean> {
        const [result] = await pool.query(
            `UPDATE accounts 
             SET isVerified = true, verificationToken = NULL 
             WHERE verificationToken = ? AND isVerified = false`,
            [token]
        );
        return (result as any).affectedRows > 0;
    }
    
    static async updateRefreshToken(accountId: number, refreshToken: string | null): Promise<void> {
        await pool.query(
            'UPDATE accounts SET refreshToken = ? WHERE id = ?',
            [refreshToken, accountId]
        );
    }
    
    static async createResetToken(email: string): Promise<string | null> {
        const account = await this.getByEmail(email);
        if (!account) return null;
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
        
        await pool.query(
            'UPDATE accounts SET resetToken = ?, resetTokenExpires = ? WHERE id = ?',
            [resetToken, resetTokenExpires, account.id]
        );
        
        return resetToken;
    }
    
    static async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const account = await this.getByResetToken(token);
        if (!account) return false;
        
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        const [result] = await pool.query(
            'UPDATE accounts SET passwordHash = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?',
            [passwordHash, account.id]
        );
        
        return (result as any).affectedRows > 0;
    }
    
    static async authenticate(email: string, password: string): Promise<{ account: AccountResponse; accessToken: string; refreshToken: string } | null> {
        const account = await this.getByEmail(email);
        if (!account || !account.isVerified) return null;
        
        const isValid = await bcrypt.compare(password, account.passwordHash);
        if (!isValid) return null;
        
        const accessToken = generateAccessToken({
            id: account.id,
            email: account.email,
            role: account.role
        });
        
        const refreshToken = generateRefreshToken({
            id: account.id,
            email: account.email,
            role: account.role
        });
        
        await this.updateRefreshToken(account.id, refreshToken);
        
        const accountResponse = await this.getById(account.id);
        
        return { account: accountResponse!, accessToken, refreshToken };
    }
    
    static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        try {
            const payload = verifyRefreshToken(refreshToken);
            
            const [rows] = await pool.query(
                'SELECT * FROM accounts WHERE id = ? AND refreshToken = ?',
                [payload.id, refreshToken]
            );
            
            const account = (rows as any)[0];
            if (!account) return null;
            
            const newAccessToken = generateAccessToken({
                id: account.id,
                email: account.email,
                role: account.role
            });
            
            const newRefreshToken = generateRefreshToken({
                id: account.id,
                email: account.email,
                role: account.role
            });
            
            await this.updateRefreshToken(account.id, newRefreshToken);
            
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            return null;
        }
    }
    
    static async revokeRefreshToken(accountId: number): Promise<void> {
        await this.updateRefreshToken(accountId, null);
    }
    
    static async getAll(): Promise<AccountResponse[]> {
        const [rows] = await pool.query(
            'SELECT id, title, firstName, lastName, email, role, isVerified, createdAt, profilePicture FROM accounts ORDER BY id'
        );
        return rows as AccountResponse[];
    }
    
    // UPDATED: Added 'isVerified' field to the update method
    static async update(id: number, data: any): Promise<AccountResponse | null> {
        const fields = [];
        const values = [];
        
        if (data.title) { fields.push('title = ?'); values.push(data.title); }
        if (data.firstName) { fields.push('firstName = ?'); values.push(data.firstName); }
        if (data.lastName) { fields.push('lastName = ?'); values.push(data.lastName); }
        if (data.email) { fields.push('email = ?'); values.push(data.email); }
        if (data.isVerified !== undefined) { fields.push('isVerified = ?'); values.push(data.isVerified); }
        if (data.password) {
            const passwordHash = await bcrypt.hash(data.password, 10);
            fields.push('passwordHash = ?');
            values.push(passwordHash);
        }
        if (data.role) { fields.push('role = ?'); values.push(data.role); }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        await pool.query(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
        
        return this.getById(id);
    }
    
    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.query('DELETE FROM accounts WHERE id = ?', [id]);
        return (result as any).affectedRows > 0;
    }
}