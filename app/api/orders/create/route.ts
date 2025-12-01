import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      deliveryMethod,
      storeId,
      address,
      paymentReference,
      subtotal,
      shippingCost,
      totalAmount
    } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      )
    }

    if (!customerEmail || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Customer details required" },
        { status: 400 }
      )
    }

    if (deliveryMethod === 'pickup' && !storeId) {
      return NextResponse.json(
        { error: "Store selection required for pickup" },
        { status: 400 }
      )
    }

    if (deliveryMethod === 'delivery' && !address) {
      return NextResponse.json(
        { error: "Delivery address required" },
        { status: 400 }
      )
    }

    // Check stock availability first (outside transaction)
    for (const item of items) {
      const productId = item.productId || item.id
      const quantity = item.quantity

      if (deliveryMethod === 'pickup' && storeId) {
        const inventory = await prisma.storeInventory.findUnique({
          where: {
            storeId_productId: {
              storeId,
              productId
            }
          }
        })

        if (!inventory || inventory.quantity < quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.productName || item.name} at selected store` },
            { status: 400 }
          )
        }
      } else {
        const inventories = await prisma.storeInventory.findMany({
          where: {
            productId,
            quantity: {
              gte: quantity
            }
          },
          take: 1
        })

        if (inventories.length === 0) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.productName || item.name}` },
            { status: 400 }
          )
        }
      }
    }

    // Generate unique order number
    const orderNumber = `OG${Date.now().toString().slice(-8)}`
    
    // Create order and deduct stock in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create shipping address if delivery method is delivery
      let addressId = null
      if (deliveryMethod === 'delivery' && address && session?.user?.id) {
        const shippingAddress = await tx.address.create({
          data: {
            userId: session.user.id,
            fullName: customerName,
            street: address.street,
            city: address.city,
            state: address.province,
            zipCode: address.postalCode,
            country: 'South Africa',
            phone: customerPhone,
            isDefault: false
          }
        })
        addressId = shippingAddress.id
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: session?.user?.id,
          orderNumber,
          customerEmail,
          customerName,
          customerPhone,
          status: 'PROCESSING',
          fulfillmentType: deliveryMethod.toUpperCase() as 'DELIVERY' | 'PICKUP',
          pickupStoreId: deliveryMethod === 'pickup' ? storeId : null,
          addressId: addressId,
          // Store delivery address directly in order for all orders
          deliveryStreet: deliveryMethod === 'delivery' && address ? address.street : null,
          deliveryCity: deliveryMethod === 'delivery' && address ? address.city : null,
          deliveryState: deliveryMethod === 'delivery' && address ? address.province : null,
          deliveryZipCode: deliveryMethod === 'delivery' && address ? address.postalCode : null,
          deliveryCountry: deliveryMethod === 'delivery' ? 'South Africa' : null,
          total: totalAmount,
          subtotal: subtotal || totalAmount,
          tax: 0,
          shippingCost: shippingCost || 0,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId || item.id,
              quantity: item.quantity,
              price: item.productPrice || item.product?.price || item.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          pickupStore: true,
          shippingAddress: true
        }
      })

      // Deduct stock
      for (const item of items) {
        const productId = item.productId || item.id
        const quantity = item.quantity

        if (deliveryMethod === 'pickup' && storeId) {
          await tx.storeInventory.update({
            where: {
              storeId_productId: {
                storeId,
                productId
              }
            },
            data: {
              quantity: {
                decrement: quantity
              }
            }
          })
        } else {
          const inventory = await tx.storeInventory.findFirst({
            where: {
              productId,
              quantity: {
                gte: quantity
              }
            },
            orderBy: {
              quantity: 'desc'
            }
          })

          if (inventory) {
            await tx.storeInventory.update({
              where: {
                id: inventory.id
              },
              data: {
                quantity: {
                  decrement: quantity
                }
              }
            })
          }
        }
      }

      return newOrder
    }, {
      maxWait: 5000, // 5 seconds max wait
      timeout: 10000, // 10 seconds timeout
    })

    // Send confirmation email via Brevo
    console.log('=== EMAIL SENDING START ===')
    console.log('Customer Email:', customerEmail)
    console.log('Order Number:', order.orderNumber)
    console.log('Brevo API Key exists:', !!process.env.BREVO_API_KEY)
    console.log('Brevo Sender Email:', process.env.BREVO_SENDER_EMAIL)
    
    try {
      const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY || ''
        },
        body: JSON.stringify({
          sender: {
            name: 'OG Farms',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@ogfarms.co.za'
          },
          to: [
            {
              email: customerEmail,
              name: customerName
            }
          ],
          subject: `Order Confirmation #${order.orderNumber}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .hero-header { 
                  background-color: #1a1a1a;
                  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://ogfarms.co.za/hero.webp'); 
                  background-size: cover; 
                  background-position: center; 
                  padding: 60px 20px; 
                  text-align: center; 
                  position: relative;
                }
                .hero-overlay { 
                  background: rgba(0, 0, 0, 0.4); 
                  padding: 30px; 
                  border-radius: 10px;
                }
                .logo-section {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 15px;
                  margin-bottom: 20px;
                }
                .logo-icon {
                  width: 50px;
                  height: 50px;
                  display: inline-block;
                }
                .brand-name {
                  font-size: 2.5em;
                  font-weight: bold;
                  color: #4ade80;
                  margin: 0;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                }
                .hero-title {
                  color: #ffffff;
                  font-size: 1.8em;
                  margin: 10px 0;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                }
                .hero-subtitle {
                  color: #e0e0e0;
                  font-size: 1.1em;
                  margin: 5px 0;
                }
                .content { background: #f9f9f9; padding: 30px; }
                .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .item { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center;
                  padding: 12px 0; 
                  border-bottom: 1px solid #eee; 
                }
                .item-name { 
                  flex: 1; 
                  font-weight: 500;
                  color: #333;
                }
                .item-price { 
                  font-weight: bold; 
                  color: #22c55e;
                  margin-left: 20px;
                  white-space: nowrap;
                }
                .total { font-size: 1.2em; font-weight: bold; color: #22c55e; margin-top: 20px; }
                .footer { text-align: center; padding: 30px; background: #1a1a1a; color: #999; font-size: 0.9em; }
                .footer-brand { color: #4ade80; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="hero-header">
                  <div class="hero-overlay">
                    <div class="logo-section">
                      <img src="https://ogfarms.co.za/images/weed-icon.png" alt="OG Farms" class="logo-icon" />
                      <h1 class="brand-name">OG FARMS</h1>
                    </div>
                    <h2 class="hero-title">Order Confirmed! 🎉</h2>
                    <p class="hero-subtitle">Thank you for your order, ${customerName}</p>
                  </div>
                </div>
                <div class="content">
                  <p>Your order has been received and is being processed.</p>
                  
                  <div class="order-details">
                    <h2>Order #${order.orderNumber}</h2>
                    <p><strong>Status:</strong> Processing</p>
                    <p><strong>Payment Reference:</strong> ${paymentReference}</p>
                    ${deliveryMethod === 'pickup' ? `
                      <p><strong>Pickup Location:</strong> ${order.pickupStore?.name}, ${order.pickupStore?.address}</p>
                    ` : `
                      <p><strong>Delivery Address:</strong> ${address}</p>
                    `}
                    
                    <h3 style="margin-top: 20px; margin-bottom: 10px; color: #333;">Order Items:</h3>
                    ${items.map((item: any) => `
                      <div class="item">
                        <span class="item-name">${item.productName || item.name} x ${item.quantity}</span>
                        <span class="item-price">R${((item.productPrice || item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    `).join('')}
                    
                    <div class="total">
                      Total: R${totalAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <p>We'll send you another email when your order is ready ${deliveryMethod === 'pickup' ? 'for pickup' : 'for delivery'}.</p>
                  
                  <p>If you have any questions, please contact us at <strong>073 963 8575</strong></p>
                </div>
                <div class="footer">
                  <p style="margin: 10px 0;"><span class="footer-brand">OG FARMS</span> - Don't Panic, It's Organic.</p>
                  <p style="margin: 10px 0;">📞 073 963 8575</p>
                  <p style="margin: 10px 0;">&copy; ${new Date().getFullYear()} OG Farms. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      })

      console.log('Email API Response Status:', emailResponse.status)
      console.log('Email API Response OK:', emailResponse.ok)
      
      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        console.error('=== BREVO API ERROR ===')
        console.error('Status:', emailResponse.status)
        console.error('Error Data:', JSON.stringify(errorData, null, 2))
        console.error('======================')
      } else {
        const successData = await emailResponse.json()
        console.log('=== EMAIL SENT SUCCESSFULLY ===')
        console.log('To:', customerEmail)
        console.log('Order:', order.orderNumber)
        console.log('Message ID:', successData.messageId)
        console.log('===============================')
      }
    } catch (emailError: any) {
      console.error('=== EMAIL SENDING EXCEPTION ===')
      console.error('Error Type:', emailError.name)
      console.error('Error Message:', emailError.message)
      console.error('Stack:', emailError.stack)
      console.error('==============================')
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        orderNumber: order.orderNumber
      }
    })

  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}
