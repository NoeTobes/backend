import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const poolConfig: any = {
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
    const caPath = path.join(__dirname, '../../ca.pem');
    if (fs.existsSync(caPath)) {
        poolConfig.ssl = {
            ca: fs.readFileSync(caPath)
        };
        console.log('✅ SSL Certificate loaded for Aiven MySQL');
    } else {
        console.warn('⚠️ CA certificate not found at:', caPath);
        console.warn('Please download ca.pem from Aiven dashboard');
    }
}

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

export default pool;