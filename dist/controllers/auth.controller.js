"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const Account_model_1 = require("../models/Account.model");
const TwoFactor_model_1 = require("../models/TwoFactor.model");
const email_service_1 = require("../utils/email.service");
const express_validator_1 = require("express-validator");
const ActivityLog_model_1 = require("../models/ActivityLog.model");
const jwt_service_1 = require("../utils/jwt.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController {
    static async register(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const existingAccount = await Account_model_1.AccountModel.getByEmail(req.body.email);
            if (existingAccount) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            const account = await Account_model_1.AccountModel.create(req.body);
            if (account) {
                await ActivityLog_model_1.ActivityLogModel.log(account.id, account.email, 'REGISTER', `New user registered: ${account.email}`, req);
            }
            if (account && account.verificationToken) {
                const userName = `${account.firstName} ${account.lastName}`;
                await (0, email_service_1.sendVerificationEmail)(account.email, account.verificationToken, userName);
            }
            const { verificationToken, ...accountWithoutToken } = account;
            res.status(201).json({
                message: 'Registration successful. Please check your email for verification link.',
                account: accountWithoutToken
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async verifyEmail(req, res) {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        try {
            const account = await Account_model_1.AccountModel.getByVerificationToken(token);
            const success = await Account_model_1.AccountModel.verifyEmail(token);
            if (!success) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            if (account) {
                await ActivityLog_model_1.ActivityLogModel.log(account.id, account.email, 'EMAIL_VERIFIED', 'Email address verified successfully', req);
            }
            res.json({ message: 'Email verified successfully' });
        }
        catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async authenticate(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            const account = await Account_model_1.AccountModel.getByEmail(email);
            if (!account) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isValid = await bcryptjs_1.default.compare(password, account.passwordHash);
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            if (!account.isVerified) {
                return res.status(403).json({ message: 'Email not verified' });
            }
            // Check if 2FA is enabled
            const twoFactorEnabled = account.twoFactorEnabled;
            if (twoFactorEnabled) {
                const tempToken = (0, jwt_service_1.generateAccessToken)({
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
            await Account_model_1.AccountModel.updateRefreshToken(account.id, refreshToken);
            await ActivityLog_model_1.ActivityLogModel.log(account.id, account.email, 'LOGIN', 'User logged in successfully', req);
            // Production-ready cookie settings
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE || 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            const accountResponse = await Account_model_1.AccountModel.getById(account.id);
            res.json({
                account: accountResponse,
                accessToken: accessToken
            });
        }
        catch (error) {
            console.error('Authentication error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async authenticate2FA(req, res) {
        const { userId, code } = req.body;
        try {
            const isValid = await TwoFactor_model_1.TwoFactorModel.verifyToken(userId, code);
            if (!isValid) {
                const isValidBackup = await TwoFactor_model_1.TwoFactorModel.verifyBackupCode(userId, code);
                if (!isValidBackup) {
                    return res.status(401).json({ message: 'Invalid 2FA code' });
                }
            }
            const account = await Account_model_1.AccountModel.getById(userId);
            if (!account) {
                return res.status(401).json({ message: 'User not found' });
            }
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
            await Account_model_1.AccountModel.updateRefreshToken(account.id, refreshToken);
            await ActivityLog_model_1.ActivityLogModel.log(account.id, account.email, 'LOGIN_2FA', 'User logged in with 2FA', req);
            // Production-ready cookie settings
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE || 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({
                account: account,
                accessToken: accessToken
            });
        }
        catch (error) {
            console.error('2FA authentication error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }
        try {
            const result = await Account_model_1.AccountModel.refreshToken(refreshToken);
            if (!result) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
            // Production-ready cookie settings
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_SECURE === 'true',
                sameSite: process.env.COOKIE_SAMESITE || 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({ accessToken: result.accessToken });
        }
        catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async revokeToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const userId = req.user?.id;
            if (userId && typeof userId === 'number') {
                const account = await Account_model_1.AccountModel.getById(userId);
                if (account) {
                    await ActivityLog_model_1.ActivityLogModel.log(userId, account.email, 'LOGOUT', 'User logged out successfully', req);
                }
                await Account_model_1.AccountModel.revokeRefreshToken(userId);
            }
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Token revoked successfully' });
    }
    static async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            const resetToken = await Account_model_1.AccountModel.createResetToken(email);
            if (resetToken) {
                const account = await Account_model_1.AccountModel.getByEmail(email);
                if (account) {
                    const userName = `${account.firstName} ${account.lastName}`;
                    await (0, email_service_1.sendPasswordResetEmail)(email, resetToken, userName);
                    await ActivityLog_model_1.ActivityLogModel.log(account.id, account.email, 'PASSWORD_RESET_REQUESTED', 'Password reset requested', req);
                }
            }
            res.json({ message: 'If your email is registered, you will receive a password reset link' });
        }
        catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async validateResetToken(req, res) {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        try {
            const account = await Account_model_1.AccountModel.getByResetToken(token);
            if (!account) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            res.json({ message: 'Token is valid' });
        }
        catch (error) {
            console.error('Validate reset token error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async resetPassword(req, res) {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }
        try {
            const account = await Account_model_1.AccountModel.getByResetToken(token);
            const success = await Account_model_1.AccountModel.resetPassword(token, password);
            if (!success) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            if (account) {
                await ActivityLog_model_1.ActivityLogModel.log(account.id, account.email, 'PASSWORD_RESET', 'Password reset successfully', req);
            }
            res.json({ message: 'Password reset successfully' });
        }
        catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
