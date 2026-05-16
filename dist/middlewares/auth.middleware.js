"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const jwt_service_1 = require("../utils/jwt.service");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Backend - Auth Header:', authHeader); // Debug log
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.substring(7);
    console.log('Backend - Token extracted:', token.substring(0, 20) + '...'); // Debug log
    try {
        const payload = (0, jwt_service_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        console.error('Backend - Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
