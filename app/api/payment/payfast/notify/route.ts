import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    
    // Convert to object for easier access
    const data: Record<string, string> = {}
    params.forEach((value, key) => {
      data[key] = value
    })

    console.log('PayFast IPN received:', data)

    // Extract payment details
    const paymentStatus = data.payment_status
    const paymentId = data.m_payment_id      // our OG-{timestamp} reference
    const pfPaymentId = data.pf_payment_id   // PayFast's own payment ID
    const amount = data.amount_gross
    const merchantId = data.merchant_id

    // Verify it's from PayFast (basic check)
    const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_MODE !== 'live'
    const expectedMerchantId = isSandbox ? '10000100' : (process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '32888465')
    
    if (merchantId !== expectedMerchantId) {
      console.error('Invalid merchant ID in IPN')
      return NextResponse.json({ error: 'Invalid merchant' }, { status: 400 })
    }

    // Check payment status
    if (paymentStatus === 'COMPLETE') {
      console.log(`Payment ${paymentId} completed successfully`)
      console.log(`PayFast Payment ID: ${pfPaymentId}`)
      console.log(`Amount: R${amount}`)
      
      // Save pfPaymentId onto the order matched by our paymentReference
      if (pfPaymentId && paymentId) {
        try {
          await prisma.order.updateMany({
            where: { paymentReference: paymentId },
            data: { pfPaymentId },
          })
          console.log(`Saved pfPaymentId ${pfPaymentId} to order with paymentReference ${paymentId}`)
        } catch (dbError) {
          // Order may not exist yet (created on success page) — that is fine, 
          // the success page can retry or admin can reconcile via the statements page
          console.warn('Could not update order with pfPaymentId (order may not exist yet):', dbError)
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment notification received',
        paymentId: pfPaymentId 
      })
    } else {
      console.log(`Payment ${paymentId} status: ${paymentStatus}`)
      return NextResponse.json({ 
        success: true, 
        message: 'Payment notification received',
        status: paymentStatus 
      })
    }

  } catch (error) {
    console.error('Error processing PayFast IPN:', error)
    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 })
  }
}

// PayFast also sends a GET request to verify the notify URL is accessible
export async function GET(request: Request) {
  return NextResponse.json({ message: 'PayFast notify endpoint is active' })
}
