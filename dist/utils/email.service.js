"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const emailTemplate_service_1 = require("../services/emailTemplate.service");
dotenv_1.default.config();
// Create transporter for real emails (Ethereal)
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // false for 587, true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Error:', error.message);
    }
    else {
        console.log('✅ SMTP Server is ready to send emails');
        console.log(`📧 Using Ethereal: ${process.env.SMTP_USER}`);
    }
});
const sendVerificationEmail = async (email, token, name = 'User') => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/account/verify-email?token=${token}`;
    const htmlTemplate = emailTemplate_service_1.EmailTemplateService.getVerificationEmailTemplate(name, verificationUrl);
    try {
        const info = await transporter.sendMail({
            from: `"AuthMaster" <${process.env.EMAIL_FROM || 'noreply@authmaster.com'}>`,
            to: email,
            subject: 'Verify Your Email - AuthMaster',
            html: htmlTemplate
        });
        console.log('=========================================');
        console.log('📧 VERIFICATION EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`📝 Message ID: ${info.messageId}`);
        console.log(`🔗 Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        console.log('=========================================\n');
        return true;
    }
    catch (error) {
        console.error('❌ Email send error:', error);
        return false;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, token, name = 'User') => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/account/reset-password?token=${token}`;
    const htmlTemplate = emailTemplate_service_1.EmailTemplateService.getPasswordResetEmailTemplate(name, resetUrl);
    try {
        const info = await transporter.sendMail({
            from: `"AuthMaster" <${process.env.EMAIL_FROM || 'noreply@authmaster.com'}>`,
            to: email,
            subject: 'Reset Your Password - AuthMaster',
            html: htmlTemplate
        });
        console.log('=========================================');
        console.log('📧 PASSWORD RESET EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`🔗 Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        console.log('=========================================\n');
        return true;
    }
    catch (error) {
        console.error('❌ Email send error:', error);
        return false;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, name) => {
    const htmlTemplate = emailTemplate_service_1.EmailTemplateService.getWelcomeEmailTemplate(name);
    try {
        const info = await transporter.sendMail({
            from: `"AuthMaster" <${process.env.EMAIL_FROM || 'noreply@authmaster.com'}>`,
            to: email,
            subject: 'Welcome to AuthMaster! 🎉',
            html: htmlTemplate
        });
        console.log('=========================================');
        console.log('📧 WELCOME EMAIL SENT');
        console.log(`✅ To: ${email}`);
        console.log(`🔗 Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        console.log('=========================================\n');
        return true;
    }
    catch (error) {
        console.error('❌ Email send error:', error);
        return false;
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
