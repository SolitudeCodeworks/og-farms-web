// Brevo (formerly Sendinblue) API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
  
  const emailData = {
    sender: {
      name: "OG Farms",
      email: process.env.EMAIL_FROM || "noreply@ogfarms.co.za"
    },
    to: [{ email }],
    subject: 'Reset Your Password - OG Farms',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 222, 128, 0.3);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #000000; font-size: 32px; font-weight: bold;">OG FARMS</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: bold;">Reset Your Password</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0 0; color: #4ade80; font-size: 14px; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                        </p>
                        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 30px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                        © ${new Date().getFullYear()} OG Farms. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        This is an automated email. Please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
Reset Your Password

We received a request to reset your password for your OG Farms account.

To reset your password, click the link below or copy and paste it into your browser:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

© ${new Date().getFullYear()} OG Farms. All rights reserved.
    `.trim(),
    textContent: `
Reset Your Password

We received a request to reset your password for your OG Farms account.

To reset your password, click the link below or copy and paste it into your browser:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

© ${new Date().getFullYear()} OG Farms. All rights reserved.
    `.trim(),
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Brevo API error:', errorData)
      throw new Error(`Brevo API error: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}
