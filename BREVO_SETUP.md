# Brevo Email Setup

## Environment Variables

Add these to your `.env` file:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=noreply@ogfarms.co.za
```

## Getting Your Brevo API Key

1. Go to [Brevo](https://www.brevo.com/) (formerly Sendinblue)
2. Sign up or log in
3. Navigate to **Settings** → **SMTP & API**
4. Click **Create a new API key**
5. Copy the key and add it to your `.env` file

## Email Features

The order confirmation email includes:
- Order number
- Order status (Processing)
- Payment reference
- Delivery/Pickup details
- Itemized list with prices
- Total amount
- Branded HTML template with OG Farms styling

## Testing

To test email sending:
1. Place a test order
2. Check the customer email inbox
3. Verify the email template renders correctly
4. Check server logs for any email errors

## Troubleshooting

If emails aren't sending:
- Verify your Brevo API key is correct
- Check your Brevo account is active
- Ensure sender email is verified in Brevo
- Check server logs for error messages
- Verify you haven't exceeded your Brevo sending limit
