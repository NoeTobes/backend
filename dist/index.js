"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const account_routes_1 = __importDefault(require("./routes/account.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const image_routes_1 = __importDefault(require("./routes/image.routes"));
const twoFactor_routes_1 = __importDefault(require("./routes/twoFactor.routes"));
const activityLog_routes_1 = __importDefault(require("./routes/activityLog.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
/// CORS configuration (line ~30)
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static files with proper headers
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
}, express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/accounts', auth_routes_1.default);
app.use('/accounts', account_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/images', image_routes_1.default);
app.use('/api/2fa', twoFactor_routes_1.default);
app.use('/api/activity-logs', activityLog_routes_1.default);
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
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: isProduction ? 'Internal server error' : err.message
    });
});
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${frontendUrl}`);
    console.log(`🍪 Cookie Secure: ${process.env.COOKIE_SECURE === 'true'}`);
    console.log(`=================================`);
});
exports.default = app;
