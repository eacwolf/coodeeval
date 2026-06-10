# 📧 Email Service Integration Guide

## Overview
Your backend now includes a complete email service powered by **Resend**. All emails are sent through Resend with the sender name configured as **ITTransformNXT**.

## Setup Instructions

### 1. Get Your Resend API Key
- Visit [Resend.com](https://resend.com)
- Sign up or log in to your account
- Go to API Keys section
- Create a new API key and copy it

### 2. Configure Environment Variables
Edit your `backend/.env` file and add:
```env
RESEND_API_KEY=your_actual_resend_api_key_here
SENDER_EMAIL=noreply@itransformnxt.com
```

### 3. Update Sender Email (Optional)
If you want to change the sender email or company name, edit `backend/emailService.js`:
```javascript
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@itransformnxt.com";
const COMPANY_NAME = "ITTransformNXT";
```

## Available Email Endpoints

### 1. Check Email Service Status
**GET** `/api/email/status`
```json
Response:
{
  "configured": true,
  "message": "Email service is ready"
}
```

### 2. Send Verification Email
**POST** `/api/email/send-verification`
```json
Request Body:
{
  "email": "user@example.com",
  "verificationCode": "123456"
}

Response:
{
  "message": "Verification email sent successfully",
  "data": { ... }
}
```

### 3. Send Password Reset Email
**POST** `/api/email/send-password-reset`
```json
Request Body:
{
  "email": "user@example.com",
  "resetToken": "abc123xyz",
  "resetLink": "https://yourapp.com/reset?token=abc123xyz"
}

Response:
{
  "message": "Password reset email sent successfully",
  "data": { ... }
}
```

### 4. Send Welcome Email
**POST** `/api/email/send-welcome`
```json
Request Body:
{
  "email": "user@example.com",
  "userName": "John Doe"
}

Response:
{
  "message": "Welcome email sent successfully",
  "data": { ... }
}
```

### 5. Send Custom Email
**POST** `/api/email/send-custom`
```json
Request Body:
{
  "email": "user@example.com",
  "subject": "Your Custom Subject",
  "htmlContent": "<h1>Hello</h1><p>Your HTML content here</p>"
}

Response:
{
  "message": "Custom email sent successfully",
  "data": { ... }
}
```

### 6. Send Batch Emails
**POST** `/api/email/send-batch`
```json
Request Body:
{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Batch Email Subject",
  "htmlContent": "<h1>Hello</h1><p>Your HTML content here</p>"
}

Response:
{
  "message": "Batch email sent to 2 recipients",
  "data": { ... }
}
```

## Using Email Service Functions in Your Code

### Import the Email Service
```javascript
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail, 
  sendCustomEmail,
  sendBatchEmails,
  isEmailServiceConfigured 
} from "./emailService.js";
```

### Example: Send Verification Email
```javascript
const result = await sendVerificationEmail("user@example.com", "123456");
if (result.success) {
  console.log("Email sent!", result.data);
} else {
  console.error("Email failed:", result.error);
}
```

### Example: Check if Email Service is Available
```javascript
if (isEmailServiceConfigured()) {
  console.log("Email service is ready to use!");
} else {
  console.log("Email service not configured - add RESEND_API_KEY");
}
```

## Email Templates

All emails are formatted with:
- **Sender**: ITTransformNXT <noreply@itransformnxt.com>
- **Professional HTML templates** with company branding
- **Clear call-to-actions** and verification codes
- **Expiration timers** where applicable

### Email Types:
1. **Verification Email** - 10-minute expiration
2. **Password Reset Email** - 30-minute expiration
3. **Welcome Email** - New user onboarding
4. **Custom Email** - Your own HTML content
5. **Batch Emails** - Multiple recipients

## Testing

### Test Email Status
```bash
curl http://localhost:5000/api/email/status
```

### Test Sending an Email
```bash
curl -X POST http://localhost:5000/api/email/send-custom \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subject": "Test Email",
    "htmlContent": "<h1>Hello</h1><p>This is a test email</p>"
  }'
```

## Troubleshooting

### Email Service Not Configured
- ✅ Ensure `RESEND_API_KEY` is set in `.env`
- ✅ Restart the backend server after changing `.env`
- ✅ Check that `.env` file exists (copy from `.env.example` if needed)

### Emails Not Sending
- ✅ Verify API key is correct and valid
- ✅ Check backend console logs for error messages
- ✅ Ensure email addresses are valid
- ✅ Check Resend dashboard for failed deliveries

### DNS/Domain Issues
- ✅ Verify your domain is configured in Resend
- ✅ Update SENDER_EMAIL to use your verified domain
- ✅ Check DNS records in Resend dashboard

## Next Steps

1. **Add to Registration Flow**: Send verification email when users register
2. **Add to Login**: Send password reset email when requested
3. **Add to Profile**: Send welcome email to new verified users
4. **Customize Templates**: Edit `emailService.js` to match your brand
5. **Add Database**: Move from in-memory storage to a real database

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Best Practices](https://resend.com/docs/guide/best-practices)

---
**Note**: All emails sent through this service will use the ITTransformNXT company branding by default. Customize as needed!
