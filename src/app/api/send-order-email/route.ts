import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, orderReference, items, total, address, city, state, hasPreOrder } = body;

    // Construct the items list in HTML
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #eaeaea;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000000;">
            ${item.product_name}
            ${item.is_preorder ? '<span style="display: inline-block; margin-left: 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #b45309; background: #fffbeb; padding: 2px 8px; border-radius: 4px;">Pre-Order</span>' : ''}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">
            Quantity: ${item.quantity}
            ${item.is_preorder ? ' · Delivery in 10–14 days' : ''}
          </p>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #eaeaea; text-align: right; font-size: 14px; font-weight: bold; color: #000000;">
          ₦${(item.price_at_purchase * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    const preOrderNotice = hasPreOrder ? `
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 4px; margin-bottom: 32px;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #b45309; margin: 0 0 8px 0; font-weight: bold;">Pre-Order Items in Your Order</p>
          <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #333333;">
            One or more items in your order are currently sold out and have been placed on pre-order. These pieces typically take <strong>10 to 14 days</strong> to arrive. We will contact you via phone or WhatsApp once your items are ready to ship.
          </p>
        </div>
    ` : '';

    const introText = hasPreOrder
      ? `Thank you so much for your order! We have received your payment securely (Order #${orderReference}). Some items in your order are on pre-order and will take 10–14 days. We will call or WhatsApp you once everything is ready to ship.`
      : `Thank you so much for your order! We have received your payment securely (Order #${orderReference}). Our team is packing your items now, and we will call or WhatsApp you very soon to arrange your delivery.`;

    // The Friendly but Professional Email Template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #000000; background-color: #ffffff;">
        
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin: 0;">LEES JEWELLERS.</h1>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px; color: #333333;">
          ${introText}
        </p>

        ${preOrderNotice}
        
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
            Lees Jewellers<br />
            33A Adebayo Doherty Road, Lekki Phase 1, Lagos<br />
            leelagos@gmail.com | +234 916 000 3594
          </p>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: "Lees Jewellers <orders@leelagos.com>",
      to: [email],
      replyTo: 'leelagos@gmail.com',
      subject: `Order Confirmed! (#${orderReference}) - Lees Jewellers`,
      html: emailHtml,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Resend Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}