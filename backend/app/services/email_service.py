"""
Email Service Module
Handles sending emails for verification, password reset, and notifications.
Supports both SMTP and development mode (mock/console logging).
"""
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Email Configuration from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@medai.app")
SENDER_NAME = os.getenv("SENDER_NAME", "MedAI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Development mode - logs emails instead of sending
DEV_MODE = os.getenv("EMAIL_DEV_MODE", "true").lower() == "true"


class EmailService:
    """Service for sending emails"""
    
    def __init__(self):
        self.smtp_host = SMTP_HOST
        self.smtp_port = SMTP_PORT
        self.smtp_user = SMTP_USER
        self.smtp_password = SMTP_PASSWORD
        self.sender_email = SENDER_EMAIL
        self.sender_name = SENDER_NAME
        self.dev_mode = DEV_MODE
    
    def _send_email(self, to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
        """
        Send an email using SMTP.
        Returns True on success, False on failure.
        """
        if self.dev_mode:
            # Development mode - log email to console
            logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║  📧 EMAIL (DEV MODE)                                         ║
╠══════════════════════════════════════════════════════════════╣
║  To: {to_email:<55}║
║  Subject: {subject:<49}║
╠══════════════════════════════════════════════════════════════╣
{text_content or html_content[:500]}
╚══════════════════════════════════════════════════════════════╝
            """)
            return True
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.sender_name} <{self.sender_email}>"
            message["To"] = to_email
            
            # Add plain text and HTML parts
            if text_content:
                message.attach(MIMEText(text_content, "plain"))
            message.attach(MIMEText(html_content, "html"))
            
            # Create secure connection
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_email(self, to_email: str, username: str, verification_token: str) -> bool:
        """Send email verification link"""
        verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
        
        subject = "Verify your MedAI account"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 40px 30px; }}
                .btn {{ display: inline-block; background: #000; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }}
                .footer {{ padding: 20px 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }}
                .code {{ background: #f0f0f0; padding: 10px 20px; border-radius: 8px; font-family: monospace; font-size: 20px; letter-spacing: 2px; margin: 15px 0; display: inline-block; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 Welcome to MedAI</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>{username}</strong>,</p>
                    <p>Thank you for creating an account! Please verify your email address to get started.</p>
                    <div style="text-align: center;">
                        <a href="{verification_url}" class="btn">Verify Email</a>
                    </div>
                    <p style="color: #666; font-size: 13px; margin-top: 30px;">
                        Or copy this link:<br>
                        <code style="word-break: break-all;">{verification_url}</code>
                    </p>
                    <p style="color: #888; font-size: 12px;">This link expires in 24 hours.</p>
                </div>
                <div class="footer">
                    <p>© {datetime.now().year} MedAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Hello {username},

Thank you for creating a MedAI account! 

Please verify your email by visiting:
{verification_url}

This link expires in 24 hours.

- The MedAI Team
        """
        
        return self._send_email(to_email, subject, html_content, text_content)
    
    def send_password_reset_email(self, to_email: str, username: str, reset_token: str) -> bool:
        """Send password reset link"""
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        subject = "Reset your MedAI password"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 40px 30px; }}
                .btn {{ display: inline-block; background: #000; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }}
                .footer {{ padding: 20px 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }}
                .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; color: #92400e; font-size: 13px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>{username}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to create a new one:</p>
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="btn">Reset Password</a>
                    </div>
                    <div class="warning">
                        ⚠️ If you didn't request this, you can safely ignore this email.
                    </div>
                    <p style="color: #888; font-size: 12px;">This link expires in 1 hour.</p>
                </div>
                <div class="footer">
                    <p>© {datetime.now().year} MedAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Hello {username},

We received a request to reset your password.

Reset your password here:
{reset_url}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

- The MedAI Team
        """
        
        return self._send_email(to_email, subject, html_content, text_content)
    
    def send_welcome_email(self, to_email: str, username: str) -> bool:
        """Send welcome email after verification"""
        subject = "Welcome to MedAI! 🎉"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; font-weight: 600; }}
                .content {{ padding: 40px 30px; }}
                .btn {{ display: inline-block; background: #000; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }}
                .footer {{ padding: 20px 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }}
                .feature {{ display: flex; align-items: center; gap: 12px; margin: 12px 0; }}
                .feature-icon {{ width: 36px; height: 36px; background: #f0f9ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 You're all set!</h1>
                </div>
                <div class="content">
                    <p>Welcome aboard, <strong>{username}</strong>!</p>
                    <p>Your email has been verified and your account is ready to use. Here's what you can do:</p>
                    
                    <div class="feature">
                        <div class="feature-icon">🔬</div>
                        <span>Run AI-powered medical analysis</span>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📝</div>
                        <span>Track your diagnosis history</span>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🤖</div>
                        <span>Chat with MedGemma AI</span>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="{FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© {datetime.now().year} MedAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Welcome aboard, {username}!

Your email has been verified and your account is ready to use.

Go to your dashboard: {FRONTEND_URL}/dashboard

- The MedAI Team
        """
        
        return self._send_email(to_email, subject, html_content, text_content)


# Global email service instance
email_service = EmailService()
