import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify API key is configured
if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured in environment variables');
} else {
    console.log('✅ Resend API is ready to send emails');
}

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
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                        .content { padding: 40px 30px; text-align: center; }
                        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                        .button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102,126,234,0.4); }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                        .link { word-break: break-all; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Verify Your Email</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for registering with <strong>AuthMaster</strong>. Please verify your email address to complete your registration.</p>
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            <p>Or copy this link:</p>
                            <div class="link">${verificationUrl}</div>
                            <p style="margin-top: 20px; font-size: 12px; color: #999;">This link will expire in 24 hours.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} AuthMaster. All rights reserved.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        
        if (error) {
            console.error('❌ Resend API error:', error);
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
                <head>
                    <meta charset="UTF-8">
                    <title>Reset Your Password</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                        .content { padding: 40px 30px; text-align: center; }
                        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; border-left: 4px solid #ffc107; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Reset Your Password</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>We received a request to reset your password. Click the button below to create a new password.</p>
                            <a href="${resetUrl}" class="button">Reset Password</a>
                            <div class="warning">
                                <strong>⚠️ This link will expire in 1 hour.</strong>
                            </div>
                            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} AuthMaster. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        
        if (error) {
            console.error('❌ Resend API error:', error);
            return false;
        }
        
        console.log('=========================================');
        console.log('📧 PASSWORD RESET EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`📝 Message ID: ${data?.id}`);
        console.log('=========================================\n');
        
        return true;
    } catch (error) {
        console.error('❌ Password reset email error:', error);
        return false;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Welcome to AuthMaster! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Welcome to AuthMaster</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                        .content { padding: 40px 30px; text-align: center; }
                        .features { display: flex; justify-content: space-around; margin: 30px 0; }
                        .feature { text-align: center; flex: 1; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to AuthMaster! 🎉</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for joining AuthMaster. We're excited to have you on board!</p>
                            <div class="features">
                                <div class="feature">🔒 Secure Authentication</div>
                                <div class="feature">🚀 Fast & Reliable</div>
                                <div class="feature">💪 Powerful Features</div>
                            </div>
                            <p>You can now login and start using all the features of our platform.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} AuthMaster. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        
        if (error) {
            console.error('❌ Resend API error:', error);
            return false;
        }
        
        console.log('=========================================');
        console.log('📧 WELCOME EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log('=========================================\n');
        
        return true;
    } catch (error) {
        console.error('❌ Welcome email error:', error);
        return false;
    }
};