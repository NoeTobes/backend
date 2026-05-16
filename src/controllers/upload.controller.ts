import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

export class UploadController {
    static uploadProfilePicture = upload.single('profilePicture');
    
    static async handleUpload(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            
            const accountId = (req as any).user.id;
            const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
            
            console.log('File saved:', req.file.filename);
            console.log('Profile picture URL:', profilePictureUrl);
            
            // Update database with profile picture URL
            const pool = require('../config/database').default;
            await pool.query(
                'UPDATE accounts SET profilePicture = ? WHERE id = ?',
                [profilePictureUrl, accountId]
            );
            
            res.json({ 
                message: 'Profile picture uploaded successfully',
                profilePicture: profilePictureUrl
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Upload failed' });
        }
    }
}