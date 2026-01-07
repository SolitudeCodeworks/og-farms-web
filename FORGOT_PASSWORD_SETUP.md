# Forgot Password Setup Guide

## Overview
This guide covers the forgot password and password reset functionality that has been added to the OG Farms application.

## Features Implemented

1. **Forgot Password Page** (`/forgot-password`)
   - User enters their email address
   - System sends password reset link via Brevo email service
   - Security: Always shows success message to prevent email enumeration

2. **Password Reset Page** (`/reset-password?token=xxx`)
   - Token validation on page load
   - Password requirements matching registration:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
   - Real-time validation feedback
   - Show/hide password toggle
   - Token expires after 1 hour

3. **Email Integration**
   - Uses Brevo (formerly Sendinblue) API for sending emails
   - Professional HTML email template with OG Farms branding
   - Includes both HTML and plain text versions

## Environment Variables Required

Add these to your `.env` file:

```env
# Brevo Email Configuration
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=noreply@ogfarms.co.za

# Application URL (for reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Database Migration

The following fields were added to the `User` model in Prisma:

```prisma
model User {
  // ... existing fields
  resetPasswordToken     String?   @unique
  resetPasswordExpires   DateTime?
  // ... rest of fields
}
```

### Run the migration:

```bash
# Generate Prisma client with new fields
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_password_reset_fields

# Or for production
npx prisma migrate deploy
```

## API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

### 2. Validate Reset Token
**POST** `/api/auth/validate-reset-token`

Request body:
```json
{
  "token": "reset_token_here"
}
```

Response:
```json
{
  "valid": true
}
```

### 3. Reset Password
**POST** `/api/auth/reset-password`

Request body:
```json
{
  "token": "reset_token_here",
  "password": "NewPassword123"
}
```

Response:
```json
{
  "message": "Password has been reset successfully"
}
```

## Brevo Setup

1. **Create Brevo Account**
   - Go to https://www.brevo.com/
   - Sign up for a free account (300 emails/day free tier)

2. **Get API Key**
   - Navigate to Settings → SMTP & API
   - Click "Create a new API key"
   - Copy the API key and add to `.env` as `BREVO_API_KEY`

3. **Verify Sender Email**
   - Go to Senders & IP
   - Add and verify your sender email address
   - Use this email in `EMAIL_FROM` environment variable

4. **Test Email Sending**
   - Use the forgot password form to test
   - Check Brevo dashboard for email statistics

## User Flow

1. User clicks "Forgot password?" on login page
2. User enters email on `/forgot-password` page
3. System generates secure token and saves to database
4. Email sent via Brevo with reset link
5. User clicks link in email → redirected to `/reset-password?token=xxx`
6. Token validated (checks existence and expiration)
7. User enters new password with validation
8. Password updated, token cleared from database
9. User redirected to login page

## Security Features

- **Token Expiration**: Reset tokens expire after 1 hour
- **Secure Token Generation**: Uses crypto.randomBytes(32) for tokens
- **Password Hashing**: Passwords hashed with bcryptjs
- **Email Enumeration Prevention**: Always shows success message
- **Token Cleanup**: Tokens cleared after successful reset
- **Password Validation**: Same strict requirements as registration

## Files Created/Modified

### New Files:
- `app/forgot-password/page.tsx` - Forgot password form
- `app/reset-password/page.tsx` - Password reset form with validation
- `app/api/auth/forgot-password/route.ts` - Generate token and send email
- `app/api/auth/validate-reset-token/route.ts` - Validate reset token
- `app/api/auth/reset-password/route.ts` - Reset password endpoint
- `lib/email.ts` - Brevo email utility
- `FORGOT_PASSWORD_SETUP.md` - This documentation

### Modified Files:
- `prisma/schema.prisma` - Added resetPasswordToken and resetPasswordExpires fields
- `app/login/page.tsx` - Already had "Forgot password?" link

## Testing

1. **Test Forgot Password Flow:**
   ```bash
   # Start development server
   npm run dev
   
   # Navigate to http://localhost:3000/login
   # Click "Forgot password?"
   # Enter a valid user email
   # Check email inbox for reset link
   ```

2. **Test Password Reset:**
   ```bash
   # Click link in email
   # Should redirect to reset password page
   # Enter new password meeting requirements
   # Submit and verify redirect to login
   # Login with new password
   ```

3. **Test Token Expiration:**
   ```bash
   # Request password reset
   # Wait 1+ hours
   # Try to use reset link
   # Should show "expired token" error
   ```

## Troubleshooting

### Email Not Sending
- Check `BREVO_API_KEY` is correct
- Verify sender email is verified in Brevo dashboard
- Check Brevo dashboard for error logs
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Token Not Found
- Run Prisma migration: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`
- Restart development server

### Password Validation Failing
- Ensure password meets all requirements:
  - Minimum 8 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)

## Production Deployment

1. Update environment variables in production:
   ```env
   BREVO_API_KEY=your_production_api_key
   EMAIL_FROM=noreply@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. Run production migration:
   ```bash
   npx prisma migrate deploy
   ```

3. Test the complete flow in production environment

## Support

For issues or questions:
- Check Brevo API documentation: https://developers.brevo.com/
- Review Prisma migration docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Check application logs for detailed error messages
