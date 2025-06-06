import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json({ 
        error: 'Content type must be multipart/form-data' 
      }, { 
        status: 400 
      });
    }

    const formData = await request.formData();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Get email data from formData
    const from = formData.get('from') as string;
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const html = formData.get('body') as string;

    if (!from || !to || !subject || !html) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { 
        status: 400 
      });
    }

    // Process attachments
    const attachments = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment')) {
        const file = value as File;
        attachments.push({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type
        });
      }
    }

    // Send email with attachments
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'System'}" <${from}>`,
      to,
      subject,
      html,
      attachments
    });

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email' 
    }, { 
      status: 500 
    });
  }
}