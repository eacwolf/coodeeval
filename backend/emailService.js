import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@updates.transformnxt.in";
const SENDER_NAME = process.env.SENDER_NAME || "TransformNXT";
const COMPANY_NAME = process.env.COMPANY_NAME || "TransformNXT";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send verification email with code
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  if (!resend) {
    console.warn("Resend not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: `Verify Your ${COMPANY_NAME} Email`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for registering with ${COMPANY_NAME}. Please verify your email address using the code below:</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't register for this account, you can safely ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <footer style="color: #666; font-size: 12px;">
            <p>${COMPANY_NAME} - Transforming Technology</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </footer>
        </div>
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  if (!resend) {
    console.warn("Resend not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: `${COMPANY_NAME} - Password Reset Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your ${COMPANY_NAME} account.</p>
          
          <p>Your password reset code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #d9534f; letter-spacing: 5px; margin: 0;">${resetToken}</h1>
          </div>
          
          <p>This code will expire in 30 minutes.</p>
          <p><strong>Do not share this code with anyone.</strong></p>
          <p>If you did not request this password reset, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <footer style="color: #666; font-size: 12px;">
            <p>${COMPANY_NAME} - Transforming Technology</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </footer>
        </div>
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email, userName) => {
  if (!resend) {
    console.warn("Resend not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: `Welcome to ${COMPANY_NAME}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ${COMPANY_NAME}!</h2>
          <p>Hi ${userName || "there"},</p>
          <p>Thank you for joining ${COMPANY_NAME}. We're excited to have you on board!</p>
          
          <p>Here's what you can do next:</p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Complete your profile</li>
            <li>Explore our features</li>
            <li>Check out our documentation</li>
          </ul>
          
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <footer style="color: #666; font-size: 12px;">
            <p>${COMPANY_NAME} - Transforming Technology</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </footer>
        </div>
      `,
    });

    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send custom email
 */
export const sendCustomEmail = async (email, subject, htmlContent) => {
  if (!resend) {
    console.warn("Resend not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log(`✅ Email sent to ${email}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send batch emails
 */
export const sendBatchEmails = async (recipients, subject, htmlContent) => {
  if (!resend) {
    console.warn("Resend not configured. Emails not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: recipients,
      subject: subject,
      html: htmlContent,
    });

    console.log(`✅ Batch email sent to ${recipients.length} recipients`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Failed to send batch email:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if email service is configured
 */
export const isEmailServiceConfigured = () => {
  return resend !== null && RESEND_API_KEY !== "";
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendCustomEmail,
  sendBatchEmails,
  isEmailServiceConfigured,
};
