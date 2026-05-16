import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types';

export const generateAccessToken = (payload: TokenPayload, expiresIn?: string): string => {
    const secret = process.env.JWT_SECRET || 'default-secret-change-this';
    const expiry = expiresIn || process.env.JWT_EXPIRES_IN || '15m';
    
    const options: SignOptions = {
        expiresIn: expiry as any
    };
    
    return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    const options: SignOptions = {
        expiresIn: expiresIn as any
    };
    
    return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET || 'default-secret-change-this';
    return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this';
    return jwt.verify(token, secret) as TokenPayload;
};