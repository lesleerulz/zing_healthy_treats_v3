import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as crypto from "node:crypto"
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts"

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = req.headers.get('x-paystack-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 401 })
  }

  const rawBody = await req.text()
  
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY')
  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY not set')
    return new Response('Server error', { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    console.error('Invalid signature')
    return new Response('Invalid signature', { status: 401 })
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (body.event === 'charge.success') {
    const reference = body.data.reference
    const amount = body.data.amount

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase env vars missing')
      return new Response('Server error', { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('guest_order')
      .select(`
        *,
        order_item (
          quantity,
          product (
            title,
            price_ksh
          )
        )
      `)
      .eq('reference', reference)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return new Response('Order not found', { status: 404 })
    }

    // Verify amount
    if (amount !== order.total_ksh * 100) {
      console.error(`Amount mismatch: expected ${order.total_ksh * 100}, got ${amount}`)
      return new Response('Amount mismatch', { status: 400 })
    }

    // Check status
    if (order.status !== 'pending') {
      console.log('Order already processed or not pending')
      return new Response(JSON.stringify({ received: true }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    // Call RPC to confirm payment
    const { error } = await supabase.rpc('confirm_payment', { p_reference: reference })

    if (error) {
      console.error('Error confirming payment:', error)
      return new Response('Error confirming payment', { status: 500 })
    }

    // Save verified phone number to user profile if user_id is present
    const extractedPhone = body.data.customer?.phone || body.data.authorization?.mobile_money_number;
    if (extractedPhone && order.user_id) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(order.user_id, { 
        phone: extractedPhone, 
        user_metadata: { verified_phone: extractedPhone } 
      });
      if (updateError) {
        console.error('Error updating user phone:', updateError);
      } else {
        console.log(`Updated user ${order.user_id} with phone ${extractedPhone}`);
      }
    }

    // Send invoice email
    try {
      const mailUsername = Deno.env.get('MAIL_USERNAME')
      const mailPassword = Deno.env.get('MAIL_PASSWORD')
      
      if (mailUsername && mailPassword && order.customer_email) {
        const client = new SmtpClient()
        await client.connectTLS({
          hostname: "smtp.gmail.com",
          port: 465,
          username: mailUsername,
          password: mailPassword,
        })

        const itemsHtml = order.order_item.map((item: any) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #a08b6e;">${item.product.title} x ${item.quantity}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #a08b6e; text-align: right;">Ksh ${item.product.price_ksh * item.quantity}</td>
          </tr>
        `).join('')

        const htmlContent = `
          <div style="background-color: #f5ede0; color: #1a1208; font-family: 'Times New Roman', serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #a08b6e;">
            <h1 style="text-align: center; color: #b8651f; margin-bottom: 10px; font-weight: normal; font-style: italic;">Zing Healthy Eats</h1>
            <h3 style="text-align: center; font-family: monospace; color: #a08b6e; letter-spacing: 2px; text-transform: uppercase; margin-top: 0;">Payment Receipt</h3>
            
            <p style="margin-top: 30px;">Dear Customer,</p>
            <p>Thank you for your order! Your payment has been successfully processed.</p>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #a08b6e; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #b8651f;">Order Details</h4>
              <p style="font-family: monospace; font-size: 14px;"><strong>Reference:</strong> ${order.reference}</p>
              <p style="font-family: monospace; font-size: 14px;"><strong>Address:</strong> ${order.customer_address || 'N/A'}</p>
              
              <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-family: monospace;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 20px 0 0; font-weight: bold;">TOTAL</td>
                  <td style="padding: 20px 0 0; text-align: right; font-weight: bold; color: #b8651f;">Ksh ${order.total_ksh}</td>
                </tr>
              </table>
            </div>
            
            <p style="text-align: center; font-style: italic; color: #a08b6e; font-size: 14px;">Eat well, live well.</p>
          </div>
        `

        await client.send({
          from: mailUsername,
          to: order.customer_email,
          subject: "Your Zing Healthy Eats Receipt",
          content: "auto",
          html: htmlContent,
        })
        
        await client.close()
        console.log('Invoice email sent to', order.customer_email)
      } else {
        console.log('Mail credentials or customer email missing, skipping email.')
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Do not return error response to Paystack
    }
  }

  return new Response(JSON.stringify({ received: true }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  })
})
