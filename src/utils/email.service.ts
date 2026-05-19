import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string, name: string = 'User') => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/account/verify-email?token=${token}`;
    
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Verify Your Email - AuthMaster',
            html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Verify Email</title></head>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">Verify Your Email</h2>
                        <p>Hi ${name},</p>
                        <p>Thank you for registering with AuthMaster. Please verify your email address to complete your registration.</p>
                        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                        <p style="margin-top: 20px;">Or copy this link: <br><small>${verificationUrl}</small></p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                </body>
                </html>
            `
        });
        
        if (error) {
            console.error('Resend error:', error);
            return false;
        }
        
        console.log('=========================================');
        console.log('📧 VERIFICATION EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`📝 Message ID: ${data?.id}`);
        console.log('=========================================\n');
        
        return true;
    } catch (error) {
        console.error('❌ Email send error:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string = 'User') => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/account/reset-password?token=${token}`;
    
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Reset Your Password - AuthMaster',
            html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Reset Password</title></head>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">Reset Your Password</h2>
                        <p>Hi ${name},</p>
                        <p>We received a request to reset your password. Click the button below to create a new password.</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p>This link will expire in 1 hour.</p>
                    </div>
                </body>
                </html>
            `
        });
        
        if (error) {
            console.error('Resend error:', error);
            return false;
        }
        
        console.log('✅ Password reset email sent');
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Welcome to AuthMaster! 🎉',
            html: `<h1>Welcome to AuthMaster! 🎉</h1><p>Hi ${name},</p><p>Your account has been successfully created.</p>`
        });
        console.log('✅ Welcome email sent');
        return true;
    } catch (error) {
        console.error('❌ Welcome email error:', error);
        return false;
    }
};