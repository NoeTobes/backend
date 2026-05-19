import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@authmaster.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

export const sendVerificationEmail = async (email: string, token: string, name: string = 'User') => {
    const verificationUrl = `${FRONTEND_URL}/account/verify-email?token=${token}`;
    
    const emailData = {
        sender: { email: EMAIL_FROM, name: 'AuthMaster' },
        to: [{ email: email, name: name }],
        subject: 'Verify Your Email - AuthMaster',
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Verify Your Email</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>Thank you for registering with <strong>AuthMaster</strong>. Please verify your email address to complete your registration.</p>
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </div>
                    <p style="margin-top: 20px;">Or copy this link: <br><small style="word-break: break-all;">${verificationUrl}</small></p>
                    <p style="font-size: 12px; color: #999;">This link will expire in 24 hours.</p>
                    <hr>
                    <p style="font-size: 12px; color: #999;">If you didn't create an account, please ignore this email.</p>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            }
        });
        
        console.log('=========================================');
        console.log('📧 VERIFICATION EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`📝 Message ID: ${response.data.messageId}`);
        console.log('=========================================\n');
        return true;
    } catch (error: any) {
        console.error('❌ Email send error:', error.response?.data || error.message);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string = 'User') => {
    const resetUrl = `${FRONTEND_URL}/account/reset-password?token=${token}`;
    
    const emailData = {
        sender: { email: EMAIL_FROM, name: 'AuthMaster' },
        to: [{ email: email, name: name }],
        subject: 'Reset Your Password - AuthMaster',
        htmlContent: `
            <h1>Reset Your Password</h1>
            <p>Hi ${name},</p>
            <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
            <p>This link expires in 1 hour.</p>
        `
    };
    
    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            }
        });
        console.log('✅ Password reset email sent to:', email);
        return true;
    } catch (error: any) {
        console.error('❌ Password reset email error:', error.response?.data || error.message);
        return false;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const emailData = {
        sender: { email: EMAIL_FROM, name: 'AuthMaster' },
        to: [{ email: email, name: name }],
        subject: 'Welcome to AuthMaster! 🎉',
        htmlContent: `
            <h1>Welcome to AuthMaster! 🎉</h1>
            <p>Hi ${name},</p>
            <p>Your account has been successfully created.</p>
            <p>You can now login and start using our services.</p>
        `
    };
    
    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            }
        });
        console.log('✅ Welcome email sent to:', email);
        return true;
    } catch (error: any) {
        console.error('❌ Welcome email error:', error.response?.data || error.message);
        return false;
    }
};