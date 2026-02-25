import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, orderReference, items, total, address, city, state } = body;

    // Construct the items list in HTML
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #eaeaea;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000000;">
            ${item.product_name}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">
            Quantity: ${item.quantity}
          </p>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #eaeaea; text-align: right; font-size: 14px; font-weight: bold; color: #000000;">
          ₦${(item.price_at_purchase * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    // The Friendly but Professional Email Template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #000000; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin: 0;">LEE LAGOS.</h1>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px; color: #333333;">
          Thank you so much for your order! We have received your payment securely (Order #${orderReference}). Our team is packing your items now, and we will call or WhatsApp you very soon to arrange your delivery.
        </p>
        
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #000000; padding-bottom: 10px; margin-bottom: 16px;">
          Your Order Details
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-bottom: 40px;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666666; margin: 0 0 4px 0;">Total Paid</p>
          <p style="font-size: 24px; font-weight: bold; margin: 0; color: #000000;">₦${total.toLocaleString()}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 40px;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666666; margin: 0 0 8px 0; font-weight: bold;">Delivery Address</p>
          <p style="font-size: 14px; margin: 0; line-height: 1.5; color: #333333;">
            ${address}<br/>
            ${city}, ${state}
          </p>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #eaeaea; padding-top: 32px;">
          <p style="font-size: 12px; color: #666666; margin-bottom: 8px;">Need help? Reply to this email or message us.</p>
          <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.6;">
            Lee Lagos<br />
            33A Adebayo Doherty Road, Lekki Phase 1, Lagos<br />
            leelagos@gmail.com | +234 916 000 3594
          </p>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      // IMPORTANT: Leave this exactly as 'onboarding@resend.dev' until you buy a domain name
      from: 'Lee Lagos Orders <onboarding@resend.dev>', 
      to: [email],
      replyTo: 'leelagos@gmail.com', // If they hit reply, it goes to your real email
      subject: `Order Confirmed! (#${orderReference}) - Lee Lagos`,
      html: emailHtml,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Resend Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}