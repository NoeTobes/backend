export class EmailTemplateService {
    static getVerificationEmailTemplate(name: string, verificationUrl: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 25px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #6c757d;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${name}!</h2>
                        <p>Thank you for registering with AuthMaster. Please verify your email address to complete your registration.</p>
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        <p>Or copy this link: <br><small style="color:#666;">${verificationUrl}</small></p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 AuthMaster. All rights reserved.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    static getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 25px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #6c757d;
                    }
                    .warning {
                        background: #fff3cd;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-size: 14px;
                        color: #856404;
                    }
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
                        <p>Or copy this link: <br><small style="color:#666;">${resetUrl}</small></p>
                        <div class="warning">
                            <strong>⚠️ This link will expire in 1 hour.</strong>
                        </div>
                        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 AuthMaster. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    static getWelcomeEmailTemplate(name: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to AuthMaster</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .features {
                        display: flex;
                        justify-content: space-around;
                        margin: 30px 0;
                    }
                    .feature {
                        text-align: center;
                        flex: 1;
                    }
                    .feature i {
                        font-size: 40px;
                        color: #667eea;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #6c757d;
                    }
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
                            <div class="feature">
                                <div>🔒</div>
                                <p>Secure Authentication</p>
                            </div>
                            <div class="feature">
                                <div>🚀</div>
                                <p>Fast & Reliable</p>
                            </div>
                            <div class="feature">
                                <div>💪</div>
                                <p>Powerful Features</p>
                            </div>
                        </div>
                        <p>You can now login and start using all the features of our platform.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 AuthMaster. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}