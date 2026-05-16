import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { EmailTemplateService } from '../services/emailTemplate.service';

dotenv.config();

// Create transporter for real emails (Ethereal) with Render-optimized settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    // Add these settings for Render compatibility
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    debug: true
});

// Retry helper function
const sendWithRetry = async (fn: () => Promise<any>, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.log(`📧 Email attempt ${i + 1} failed, retrying...`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
};

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Error:', error.message);
        console.log('⚠️ Email sending may not work, but verification links will be logged below');
    } else {
        console.log('✅ SMTP Server is ready to send emails');
        console.log(`📧 Using Ethereal: ${process.env.SMTP_USER}`);
    }
});

export const sendVerificationEmail = async (email: string, token: string, name: string = 'User') => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/account/verify-email?token=${token}`;
    const htmlTemplate = EmailTemplateService.getVerificationEmailTemplate(name, verificationUrl);
    
    // Always log the verification link (critical for debugging when email fails)
    console.log('=========================================');
    console.log('📧 VERIFICATION LINK (Save this to verify)');
    console.log(`To: ${email}`);
    console.log(`Link: ${verificationUrl}`);
    console.log('=========================================\n');
    
    try {
        const info = await sendWithRetry(() => transporter.sendMail({
            from: `"AuthMaster" <${process.env.EMAIL_FROM || 'noreply@authmaster.com'}>`,
            to: email,
            subject: 'Verify Your Email - AuthMaster',
            html: htmlTemplate
        }));
        
        console.log('=========================================');
        console.log('📧 VERIFICATION EMAIL SENT SUCCESSFULLY');
        console.log(`✅ To: ${email}`);
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('=========================================\n');
        
        return true;
    } catch (error) {
        console.error('❌ Email send failed, but verification link is above for manual testing');
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string = 'User') => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/account/reset-password?token=${token}`;
    const htmlTemplate = EmailTemplateService.getPasswordResetEmailTemplate(name, resetUrl);
    
    console.log('=========================================');
    console.log('📧 PASSWORD RESET LINK');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetUrl}`);
    console.log('=========================================\n');
    
    try {
        const info = await sendWithRetry(() => transporter.sendMail({
            from: `"AuthMaster" <${process.env.EMAIL_FROM || 'noreply@authmaster.com'}>`,
            to: email,
            subject: 'Reset Your Password - AuthMaster',
            html: htmlTemplate
        }));
        
        console.log(`✅ Password reset email sent! Preview: ${nodemailer.getTestMessageUrl(info)}`);
        return true;
    } catch (error) {
        console.error('❌ Password reset email failed, link above for manual use');
        return false;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const htmlTemplate = EmailTemplateService.getWelcomeEmailTemplate(name);
    
    try {
        const info = await sendWithRetry(() => transporter.sendMail({
            from: `"AuthMaster" <${process.env.EMAIL_FROM || 'noreply@authmaster.com'}>`,
            to: email,
            subject: 'Welcome to AuthMaster! 🎉',
            html: htmlTemplate
        }));
        
        console.log('=========================================');
        console.log('📧 WELCOME EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('=========================================\n');
        
        return true;
    } catch (error) {
        console.error('❌ Welcome email failed');
        return false;
    }
};