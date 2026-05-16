"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ipt_auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};
// Add SSL for Aiven MySQL (required for production)
if (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) {
    const caPath = path_1.default.join(__dirname, '../../ca.pem');
    if (fs_1.default.existsSync(caPath)) {
        poolConfig.ssl = {
            ca: fs_1.default.readFileSync(caPath)
        };
        console.log('✅ SSL Certificate loaded for Aiven MySQL');
    }
    else {
        console.warn('⚠️ CA certificate not found at:', caPath);
        console.warn('Please download ca.pem from Aiven dashboard');
    }
}
const pool = promise_1.default.createPool(poolConfig);
// Test connection
pool.getConnection()
    .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
})
    .catch(err => {
    console.error('❌ Database connection failed:', err.message);
});
exports.default = pool;
