import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.service';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    console.log('Backend - Auth Header:', authHeader); // Debug log
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    console.log('Backend - Token extracted:', token.substring(0, 20) + '...'); // Debug log
    
    try {
        const payload = verifyAccessToken(token);
        (req as any).user = payload;
        next();
    } catch (error) {
        console.error('Backend - Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role;
        
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        
        next();
    };
};