import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import uploadRoutes from './routes/upload.routes';
import imageRoutes from './routes/image.routes';
import twoFactorRoutes from './routes/twoFactor.routes';
import activityLogRoutes from './routes/activityLog.routes';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

// CORS configuration
const corsOptions = {
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
}, express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/accounts', authRoutes);
app.use('/accounts', accountRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: process.uptime()
    });
});

// API Info
app.get('/api-docs', (req, res) => {
    res.json({
        name: 'AuthMaster API',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        endpoints: {
            auth: '/accounts',
            users: '/accounts',
            upload: '/api/upload',
            images: '/api/images',
            twoFactor: '/api/2fa',
            activityLogs: '/api/activity-logs'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        message: isProduction ? 'Internal server error' : err.message 
    });
});

// Start server - bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${frontendUrl}`);
    console.log(`🍪 Cookie Secure: ${process.env.COOKIE_SECURE === 'true'}`);
    console.log(`=================================`);
});

export default app;