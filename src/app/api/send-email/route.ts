// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface AttachmentData {
  type: 'file' | 'link';
  name: string;
  data?: string; // base64 for files
  url?: string; // for links
  fileType: string;
  size?: number;
}

interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  body: string;
  template: string;
  employeeName: string;
  attachments?: AttachmentData[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      from,
      to,
      subject,
      body,
      template,
      employeeName,
      attachments = []
    }: EmailRequest = await request.json();

    // Validate required fields
    if (!from || !to || !subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter - You can choose between Gmail or SMTP
    const transporter = nodemailer.createTransport({
      // Gmail configuration
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD, // Your Gmail app password
      },
      // Or use SMTP configuration (uncomment if needed)
      // host: process.env.SMTP_HOST,
      // port: parseInt(process.env.SMTP_PORT || '587'),
      // secure: false,
      // auth: {
      //   user: process.env.SMTP_USER,
      //   pass: process.env.SMTP_PASS,
      // },
    });

    // Process attachments
    const emailAttachments: any[] = [];
    
    for (const attachment of attachments) {
      if (attachment.type === 'file' && attachment.data) {
        // Handle file uploads
        const base64Data = attachment.data.split(',')[1]; // Remove data:type;base64, prefix
        emailAttachments.push({
          filename: attachment.name,
          content: base64Data,
          encoding: 'base64',
          contentType: attachment.fileType,
        });
      } else if (attachment.type === 'link' && attachment.url) {
        // For links, we'll include them in the email body
        // You could also try to fetch and attach the file, but this requires additional handling
        continue; // Skip for now, we'll add links to the email body
      }
    }

    // Replace placeholders in the email content
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear().toString();
    const companyName = process.env.COMPANY_NAME || 'Your Company';

    const processedSubject = subject
      .replace(/\[Employee Name\]/g, employeeName || 'Employee')
      .replace(/\[Month\]/g, month)
      .replace(/\[Year\]/g, year)
      .replace(/\[Company Name\]/g, companyName);

    let processedBody = body
      .replace(/\[Employee Name\]/g, employeeName || 'Employee')
      .replace(/\[Month\]/g, month)
      .replace(/\[Year\]/g, year)
      .replace(/\[Company Name\]/g, companyName);

    // Add link attachments to email body if any
    const linkAttachments = attachments.filter(att => att.type === 'link');
    if (linkAttachments.length > 0) {
      processedBody += '<br><br><strong>Additional Resources:</strong><ul>';
      linkAttachments.forEach(link => {
        processedBody += `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`;
      });
      processedBody += '</ul>';
    }

    // Email options
    const mailOptions = {
      from: `"HR Team" <${from}>`,
      to: to,
      subject: processedSubject,
      html: processedBody,
      text: processedBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      attachments: emailAttachments,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully',
      to: to,
      subject: processedSubject,
      attachmentCount: emailAttachments.length,
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Handle specific nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        return NextResponse.json(
          { success: false, error: 'Invalid email credentials. Please check your Gmail settings.' },
          { status: 401 }
        );
      }
      if (error.message.includes('Network')) {
        return NextResponse.json(
          { success: false, error: 'Network error. Please check your internet connection.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Email API is working',
    timestamp: new Date().toISOString()
  });
}