# PayFast Integration Setup

## Overview
We've switched from PayStack to PayFast for payment processing.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# PayFast Configuration
NEXT_PUBLIC_PAYFAST_ENABLED=true
NEXT_PUBLIC_PAYFAST_MODE=sandbox  # or 'live' for production

# For LIVE mode, use your actual credentials:
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=32888465
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=m2qsy2eorvjln
```

**Note:** 
- **Sandbox mode** automatically uses PayFast's official test credentials (`10000100` / `46f0cd694581a`)
- **Live mode** uses your actual merchant credentials (shown above)

## Getting PayFast Credentials

1. **Sign up for PayFast**: https://www.payfast.co.za/
2. **Get Sandbox Credentials** (for testing):
   - Login to PayFast dashboard
   - Go to Settings → Integration
   - Copy your Merchant ID and Merchant Key
3. **For Production**:
   - Complete verification process
   - Switch `NEXT_PUBLIC_PAYFAST_MODE` to `live`
   - Use your live credentials

## Testing with Sandbox

PayFast Sandbox Test Cards:
- **Card Number**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Files Changed

1. **Created**: `components/checkout/payfast-button.tsx` - PayFast payment button
2. **Created**: `app/payment/success/page.tsx` - Payment success handler
3. **Created**: `app/payment/cancel/page.tsx` - Payment cancellation page
4. **Created**: `app/api/payment/payfast/notify/route.ts` - PayFast webhook (IPN) handler
5. **Updated**: `app/checkout/page.tsx` - Replaced PayStack with PayFast
6. **Old File**: `components/checkout/paystack-button.tsx` - Can be deleted

## How It Works

1. Customer fills in checkout details
2. Clicks "Pay with PayFast" button
3. Checkout data + payment ID saved to sessionStorage
4. Redirected to PayFast payment page
5. Customer completes payment on PayFast
6. **Two things happen in parallel:**
   - **Webhook (IPN)**: PayFast sends payment confirmation to `/api/payment/payfast/notify`
     - Contains: payment status, amount, PayFast payment ID
     - Logged for verification
   - **User Redirect**: Customer redirected to `/payment/success`
     - Retrieves checkout data from sessionStorage
     - Creates order in database with stored payment ID
     - Clears cart
     - Redirects to order confirmation
7. If cancelled: Redirected to `/payment/cancel`
   - Cart items remain saved

## Next Steps

1. Add PayFast credentials to `.env.local`
2. Test with sandbox mode
3. Create payment success/cancel pages (if not exists)
4. Create PayFast IPN webhook handler at `/api/payment/payfast/notify`
5. Switch to live mode when ready

## Important Notes

- PayFast uses South African Rand (ZAR) currency
- Amounts are in Rands (not cents like PayStack)
- PayFast requires a notify URL for payment confirmation
- Test thoroughly in sandbox before going live
