import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true },
            },
          },
        },
        pickupStore: { select: { name: true, city: true, address: true } },
        shippingAddress: true,
        user: { select: { name: true, email: true } },
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    // Only allow the order owner or admins
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = order.user?.email === session.user.email || order.customerEmail === session.user.email
    if (!isAdmin && !isOwner) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const orderedDate = new Date(order.createdAt).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const itemsRows = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;">
          <div style="font-weight:600;color:#111;">${item.product.name}</div>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;">${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:right;color:#555;">R ${item.price.toFixed(2)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#111;">R ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join("")

    const deliveryAddress = (() => {
      if (order.fulfillmentType === "PICKUP" && order.pickupStore) {
        return `<strong>Pickup:</strong> ${order.pickupStore.name}, ${order.pickupStore.city}`
      }
      if (order.deliveryStreet) {
        return [order.customerName, order.deliveryStreet, order.deliveryCity, order.deliveryState, order.deliveryZipCode, order.deliveryCountry]
          .filter(Boolean)
          .join(", ")
      }
      if (order.shippingAddress) {
        const a = order.shippingAddress
        return [a.fullName, a.street, a.city, a.state, a.zipCode].filter(Boolean).join(", ")
      }
      return "—"
    })()

    const paymentMethod =
      order.paymentReference === "CASH_PAYMENT"
        ? "Cash on Pickup"
        : order.paymentReference
        ? `Online Payment (Ref: ${order.paymentReference})`
        : "—"

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${order.orderNumber} — OG Farms</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #333; background: #fff; }
    .page { max-width: 760px; margin: 0 auto; padding: 40px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #4ade80; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-name { font-size: 26px; font-weight: 900; color: #111; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 12px; color: #888; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 28px; font-weight: 900; color: #111; letter-spacing: -0.5px; }
    .invoice-number { font-size: 14px; color: #4ade80; font-weight: 700; margin-top: 4px; }
    .invoice-date { font-size: 12px; color: #888; margin-top: 4px; }

    /* Info Grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-box { background: #f9fafb; border: 1px solid #eee; border-radius: 8px; padding: 16px; }
    .info-box-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4ade80; margin-bottom: 8px; }
    .info-box p { font-size: 13px; color: #333; line-height: 1.6; }
    .info-box strong { color: #111; }

    /* Status badge */
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #dcfce7; color: #166534; }

    /* Items table */
    .items-section { margin-bottom: 24px; }
    .items-section h3 { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #111; }
    thead th { padding: 10px 8px; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:first-child { text-align: left; border-radius: 6px 0 0 6px; }
    thead th:last-child { border-radius: 0 6px 6px 0; }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody tr:hover { background: #fafafa; }

    /* Totals */
    .totals { margin-left: auto; width: 280px; margin-bottom: 32px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .totals-row span:first-child { color: #666; }
    .totals-row span:last-child { font-weight: 600; color: #111; }
    .totals-total { display: flex; justify-content: space-between; padding: 12px 0 0; font-size: 16px; font-weight: 900; color: #111; }
    .totals-total span:last-child { color: #16a34a; }

    /* Footer */
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #eee; color: #999; font-size: 11px; line-height: 1.8; }
    .footer strong { color: #4ade80; }

    /* Print */
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Print button (hidden on print) -->
    <div class="no-print" style="text-align:right;margin-bottom:16px;">
      <button onclick="window.print()" style="padding:10px 24px;background:#4ade80;color:#000;border:none;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;letter-spacing:0.3px;">
        ⬇ Save / Print Invoice
      </button>
    </div>

    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div>
          <div class="brand-name">OG Farms</div>
          <div class="brand-tagline">Premium Cannabis Delivery · South Africa</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">#${order.orderNumber}</div>
        <div class="invoice-date">${orderedDate}</div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">Bill To</div>
        <p><strong>${order.customerName}</strong></p>
        <p>${order.customerEmail}</p>
        <p>${order.customerPhone}</p>
      </div>
      <div class="info-box">
        <div class="info-box-title">Order Details</div>
        <p><strong>Order Number:</strong> #${order.orderNumber}</p>
        <p><strong>Date:</strong> ${orderedDate}</p>
        <p><strong>Status:</strong> <span class="status-badge">${order.status.replace(/_/g, " ")}</span></p>
        <p><strong>Payment:</strong> ${paymentMethod}</p>
      </div>
      <div class="info-box">
        <div class="info-box-title">Fulfillment</div>
        <p><strong>Method:</strong> ${order.fulfillmentType === "PICKUP" ? "Store Pickup" : "Delivery"}</p>
        <p>${deliveryAddress}</p>
      </div>
      ${
        order.paymentReference && order.paymentReference !== "CASH_PAYMENT"
          ? `<div class="info-box">
        <div class="info-box-title">Payment Reference</div>
        <p style="font-family:monospace;font-size:12px;word-break:break-all;">${order.paymentReference}</p>
        ${(order as any).pfPaymentId ? `<p style="margin-top:4px;"><strong>PF ID:</strong> <span style="font-family:monospace;">${(order as any).pfPaymentId}</span></p>` : ""}
      </div>`
          : `<div class="info-box">
        <div class="info-box-title">From</div>
        <p><strong>OG Farms</strong></p>
        <p>South Africa</p>
        <p>support@ogfarms.co.za</p>
      </div>`
      }
    </div>

    <!-- Items Table -->
    <div class="items-section">
      <h3>Items Ordered</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>R ${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>Shipping</span>
        <span>${order.shippingCost > 0 ? `R ${order.shippingCost.toFixed(2)}` : "Free"}</span>
      </div>
      <div class="totals-row">
        <span>Tax (VAT)</span>
        <span>R ${order.tax.toFixed(2)}</span>
      </div>
      <div class="totals-total">
        <span>TOTAL</span>
        <span>R ${order.total.toFixed(2)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your order! <strong>OG Farms</strong> — Premium Cannabis, South Africa</p>
      <p>Questions? Contact us at <strong>support@ogfarms.co.za</strong></p>
      <p style="margin-top:8px;color:#ccc;">This invoice was automatically generated and is valid without a signature.</p>
    </div>

  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
