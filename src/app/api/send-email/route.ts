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

    // Resolve SMTP credentials robustly
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : undefined;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email transport is not configured',
          details: 'Missing SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASSWORD environment variables.'
        },
        { status: 500 }
      );
    }

    // Prefer explicit SMTP config if provided; otherwise default to Gmail SMTP
    const transporter = nodemailer.createTransport(
      smtpHost
        ? {
            host: smtpHost,
            port: smtpPort ?? 587,
            secure: smtpSecure ?? false,
            auth: { user: smtpUser, pass: smtpPass },
          }
        : {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
          }
    );

    // Verify connection configuration early for clearer errors
    try {
      await transporter.verify();
    } catch (verifyError) {
      const msg = verifyError instanceof Error ? verifyError.message : String(verifyError);
      return NextResponse.json(
        {
          success: false,
          error: 'Email transport verification failed',
          details: msg,
        },
        { status: 500 }
      );
    }

    // Process attachments
    type EmailAttachment = { filename: string; content: string; encoding: 'base64'; contentType: string };
    const emailAttachments: EmailAttachment[] = [];
    
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
    const displayName = process.env.EMAIL_FROM_NAME || 'HR Team';
    const mailOptions = {
      // Use authenticated mailbox as actual sender to satisfy SMTP/DMARC; set reply-to to requested sender
      from: `${displayName} <${smtpUser}>`,
      replyTo: from,
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

  } catch (error: unknown) {
    console.error('Email sending error:', error);

    // Detailed nodemailer failure mapping
    interface MailError { message?: string; code?: string; response?: string }
    const err = (error ?? {}) as MailError;
    const message: string = err.message || '';
    const code: string = err.code || '';
    const response: string = err.response || '';

    if (typeof message === 'string' && message.toLowerCase().includes('invalid login')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email credentials. Update SMTP credentials in environment.' },
        { status: 401 }
      );
    }

    if (code === 'EAUTH') {
      return NextResponse.json(
        { success: false, error: 'SMTP authentication failed (EAUTH). Check username/password or app password.' },
        { status: 401 }
      );
    }

    if (code === 'ECONNECTION' || (typeof message === 'string' && message.includes('getaddrinfo'))) {
      return NextResponse.json(
        { success: false, error: 'SMTP connection failed. Check SMTP host/port or network connectivity.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: typeof message === 'string' ? message : 'Unknown error',
        code,
        response,
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