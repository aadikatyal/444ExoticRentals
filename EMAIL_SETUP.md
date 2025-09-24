# Email Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```bash
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
ADMIN_EMAIL=admin@444exoticrentals.com

# Or if using a different email service, update lib/email.ts accordingly
```

## Current Setup

The email system is currently set up with a mock service that logs emails to the console. This allows you to:

1. **Test the email flow** without setting up a real email service
2. **See the email content** in your server logs
3. **Verify the email triggers** are working correctly

## Email Flow

### 1. Deposit Payment
- **Customer receives**: Deposit confirmation email
- **Admin receives**: New booking notification email

### 2. Admin Approval
- **Customer receives**: Booking approved email with payment link

### 3. Final Payment
- **Customer receives**: Final confirmation email
- **Admin receives**: Booking completion notification

## Switching to Real Email Service

To use a real email service (like Resend, SendGrid, or Nodemailer):

1. **Install the email service package**:
   ```bash
   npm install resend
   # or
   npm install @sendgrid/mail
   # or
   npm install nodemailer
   ```

2. **Update `lib/email.ts`**:
   - Replace the `mockEmailService` with your chosen service
   - Uncomment the Resend import if using Resend
   - Update the email sending functions accordingly

3. **Set up your email service**:
   - Get API keys from your chosen provider
   - Add them to your environment variables
   - Verify your domain (for Resend/SendGrid)

## Email Templates

All email templates are defined in `lib/email.ts` and include:
- Professional HTML styling
- Booking details
- Next steps for customers
- Admin notifications with action items

## Testing

To test the email system:
1. Make a booking and pay the deposit
2. Check your server logs for email content
3. Approve the booking in admin panel
4. Complete the final payment
5. Verify all emails are logged correctly
