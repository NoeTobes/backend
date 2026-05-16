import { Request, Response } from 'express';
import { AccountModel } from '../models/Account.model';
import { TwoFactorModel } from '../models/TwoFactor.model';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.service';
import { validationResult } from 'express-validator';
import { ActivityLogModel } from '../models/ActivityLog.model';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.service';
import bcrypt from 'bcryptjs';

export class AuthController {
    static async register(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const existingAccount = await AccountModel.getByEmail(req.body.email);
            if (existingAccount) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            
            const account = await AccountModel.create(req.body);
            
            if (account) {
                await ActivityLogModel.log(account.id, account.email, 'REGISTER', `New user registered: ${account.email}`, req);
            }
            
            if (account && account.verificationToken) {
                const userName = `${account.firstName} ${account.lastName}`;
                await sendVerificationEmail(account.email, account.verificationToken, userName);
            }
            
            const { verificationToken, ...accountWithoutToken } = account;
            
            res.status(201).json({
                message: 'Registration successful. Please check your email for verification link.',
                account: accountWithoutToken
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async verifyEmail(req: Request, res: Response) {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        
        try {
            const account = await AccountModel.getByVerificationToken(token);
            const success = await AccountModel.verifyEmail(token);
            
            if (!success) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            
            if (account) {
                await ActivityLogModel.log(account.id, account.email, 'EMAIL_VERIFIED', 'Email address verified successfully', req);
            }
            
            res.json({ message: 'Email verified successfully' });
        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async authenticate(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { email, password } = req.body;
        
        try {
            const account = await AccountModel.getByEmail(email);
            
            if (!account) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const isValid = await bcrypt.compare(password, account.passwordHash);
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            if (!account.isVerified) {
                return res.status(403).json({ message: 'Email not verified' });
            }
            
            // Check if 2FA is enabled
            const twoFactorEnabled = (account as any).twoFactorEnabled;
            if (twoFactorEnabled) {
                const tempToken = generateAccessToken({
                    id: account.id,
                    email: account.email,
                    role: account.role
                }, '5m');
                
                return res.json({
                    requiresTwoFactor: true,
                    userId: account.id,
                    tempToken: tempToken
                });
            }
            
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
            
            await AccountModel.updateRefreshToken(account.id, refreshToken);
            await ActivityLogModel.log(account.id, account.email, 'LOGIN', 'User logged in successfully', req);
            
            // Production-ready cookie settings
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE as any || 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            const accountResponse = await AccountModel.getById(account.id);
            
            res.json({
                account: accountResponse,
                accessToken: accessToken
            });
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async authenticate2FA(req: Request, res: Response) {
        const { userId, code } = req.body;
        
        try {
            const isValid = await TwoFactorModel.verifyToken(userId, code);
            
            if (!isValid) {
                const isValidBackup = await TwoFactorModel.verifyBackupCode(userId, code);
                if (!isValidBackup) {
                    return res.status(401).json({ message: 'Invalid 2FA code' });
                }
            }
            
            const account = await AccountModel.getById(userId);
            
            if (!account) {
                return res.status(401).json({ message: 'User not found' });
            }
            
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
            
            await AccountModel.updateRefreshToken(account.id, refreshToken);
            await ActivityLogModel.log(account.id, account.email, 'LOGIN_2FA', 'User logged in with 2FA', req);
            
            // Production-ready cookie settings
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE as any || 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.json({
                account: account,
                accessToken: accessToken
            });
        } catch (error) {
            console.error('2FA authentication error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }
        
        try {
            const result = await AccountModel.refreshToken(refreshToken);
            
            if (!result) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
            
            // Production-ready cookie settings
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE as any || 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.json({ accessToken: result.accessToken });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async revokeToken(req: Request, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        
        if (refreshToken) {
            const userId = (req as any).user?.id;
            if (userId && typeof userId === 'number') {
                const account = await AccountModel.getById(userId);
                if (account) {
                    await ActivityLogModel.log(userId, account.email, 'LOGOUT', 'User logged out successfully', req);
                }
                await AccountModel.revokeRefreshToken(userId);
            }
        }
        
        res.clearCookie('refreshToken');
        res.json({ message: 'Token revoked successfully' });
    }
    
    static async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        
        try {
            const resetToken = await AccountModel.createResetToken(email);
            
            if (resetToken) {
                const account = await AccountModel.getByEmail(email);
                if (account) {
                    const userName = `${account.firstName} ${account.lastName}`;
                    await sendPasswordResetEmail(email, resetToken, userName);
                    await ActivityLogModel.log(account.id, account.email, 'PASSWORD_RESET_REQUESTED', 'Password reset requested', req);
                }
            }
            
            res.json({ message: 'If your email is registered, you will receive a password reset link' });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async validateResetToken(req: Request, res: Response) {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        
        try {
            const account = await AccountModel.getByResetToken(token);
            
            if (!account) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            
            res.json({ message: 'Token is valid' });
        } catch (error) {
            console.error('Validate reset token error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async resetPassword(req: Request, res: Response) {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }
        
        try {
            const account = await AccountModel.getByResetToken(token);
            const success = await AccountModel.resetPassword(token, password);
            
            if (!success) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            
            if (account) {
                await ActivityLogModel.log(account.id, account.email, 'PASSWORD_RESET', 'Password reset successfully', req);
            }
            
            res.json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}