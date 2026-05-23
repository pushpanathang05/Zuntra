import nodemailer from 'nodemailer';

/**
 * Sends a verification OTP code to the user's email.
 * If SMTP environment variables are not configured, it logs the code to the server console.
 * 
 * @param {string} email - Recipient email.
 * @param {string} otpCode - 6-digit verification code.
 * @returns {Promise<boolean>} True if sent (or logged) successfully.
 */
export const sendVerificationEmail = async (email, otpCode) => {
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== '<your_gmail_app_password>' &&
    process.env.SMTP_PASS.trim() !== '';

  if (!isSmtpConfigured) {
    // Development sandbox environment fallback
    console.log(`
===================================================
[NODEMAILER DEVELOPMENT FALLBACK]
Email Dispatched to: ${email}
Verification OTP Code: [ ${otpCode} ]
Valid for: 5 minutes
===================================================
`);
    return { success: true, fallback: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Pinspire Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Pinspire - Verify Your Account',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f11; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; font-family: 'Outfit', sans-serif; margin: 0; font-size: 28px;">Pinspire</h1>
            <p style="color: #a1a1aa; font-size: 12px; margin-top: 5px;">Your Visual Inspiration Workspace</p>
          </div>
          <div style="background-color: #18181b; padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.03);">
            <h2 style="font-size: 18px; margin-top: 0; color: #ffffff;">Verify your email</h2>
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin-bottom: 25px;">
              Please enter the 6-digit verification code below to activate your account. This code is valid for 5 minutes.
            </p>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; background-color: #0f0f11; padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(124,58,237,0.3); font-family: monospace;">${otpCode}</span>
            </div>
            <p style="color: #71717a; font-size: 11px; text-align: center; margin-top: 25px; line-height: 1.4;">
              If you did not request this code, please ignore this email or contact support.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
    return { success: true, fallback: false };
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
    // Fallback to console instead of failing registration
    console.log(`
===================================================
[NODEMAILER ERROR FALLBACK]
SMTP failed to connect or send. 
Email Dispatched to: ${email}
Verification OTP Code: [ ${otpCode} ]
Valid for: 5 minutes
===================================================
`);
    return { success: true, fallback: true };
  }
};
