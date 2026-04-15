import { Resend } from 'resend';
import connectDB from './db';
import Settings from '@/models/Settings';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'marketing@onepws.com';

export async function getApproverEmails(): Promise<string[]> {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings && settings.approverEmails && settings.approverEmails.length > 0) {
      return settings.approverEmails;
    }
  } catch (error) {
    console.error('Error fetching approver emails:', error);
  }
  return [process.env.ADMIN_NOTIFICATION_EMAIL || 'marketing@onepws.com'];
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Nodemailer transporter fallback (lazy load to avoid build errors)
let nodemailerTransport: any = null;

async function initializeNodemailer() {
  if (nodemailerTransport) return nodemailerTransport;
  
  if (!resend && process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      // Dynamically import nodemailer to avoid build errors if not installed
      // @ts-ignore - nodemailer is optional dependency
      const nodemailer = await import('nodemailer');
      nodemailerTransport = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (err) {
      console.warn('Nodemailer not installed. Install with: npm install nodemailer');
      nodemailerTransport = null;
    }
  }
  return nodemailerTransport;
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  // Try Resend first
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: emailFrom,
        to,
        subject,
        html,
      });

      if (result.error) {
        console.error('Resend email error:', {
          subject,
          to,
          error: result.error,
        });
        // Fall through to nodemailer if available
        const nodemailer = await initializeNodemailer();
        if (!nodemailer) {
          return { error: result.error };
        }
      } else {
        return result;
      }
    } catch (err) {
      console.error('Resend email exception:', err);
      // Fall through to nodemailer if available
      const nodemailer = await initializeNodemailer();
      if (!nodemailer) {
        return { error: err };
      }
    }
  }

  // Fallback to Nodemailer
  const nodemailer = await initializeNodemailer();
  if (nodemailer) {
    try {
      const result = await nodemailer.sendMail({
        from: emailFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });
      console.log('Email sent via Nodemailer:', result.messageId);
      return { messageId: result.messageId };
    } catch (err) {
      console.error('Nodemailer email error:', {
        subject,
        to,
        error: err,
      });
      return { error: err };
    }
  }

  // No email service configured
  console.warn('No email service configured (RESEND_API_KEY or SMTP settings missing). Email skipped:', subject);
  return { skipped: true };
}

export async function sendNewSignupEmail(user: { name: string; email: string; status: string }) {
  const approverEmails = await getApproverEmails();
  return sendEmail({
    to: approverEmails,
    subject: `New policy portal signup: ${user.name}`,
    html: renderEmailTemplate({
      title: 'New policy portal signup',
      eyebrow: 'Admin action required',
      body: `A new user has registered and is waiting for review.`,
      rows: [
        ['Name', user.name],
        ['Email', user.email],
        ['Status', user.status],
      ],
    }),
  });
}

export async function sendActivationEmail(user: { name: string; email: string; activationLink: string }) {
  const approverEmails = await getApproverEmails();
  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151">
      A new user <strong>${escapeHtml(user.name)}</strong> (${escapeHtml(user.email)}) has signed up and is requesting access to the OnePWS Policy Portal.
    </p>
    <div style="margin:22px 0;text-align:center">
      <a href="${user.activationLink}" style="display:inline-block;background:#f87171;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">Activate Account</a>
    </div>
    <p style="margin:22px 0 0;font-size:12px;color:#6b7280">Or paste this link in your browser: <br/><a href="${user.activationLink}" style="color:#0066cc;text-decoration:underline;word-break:break-all">${escapeHtml(user.activationLink)}</a></p>
  `;

  return sendEmail({
    to: approverEmails,
    subject: `Action Required: Activate Account for ${user.name}`,
    html: `
      <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
        <div style="max-width:640px;margin:0 auto;padding:32px 18px">
          <div style="background:#111827;border-radius:8px 8px 0 0;padding:22px 26px;color:#ffffff">
            <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f87171;font-weight:700">OnePWS Approval Request</div>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3">New Signup Request</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;padding:26px">
            ${bodyHtml}
            <p style="margin:22px 0 0;font-size:12px;color:#6b7280">This is an automated email from OnePWS.</p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendActivationConfirmationEmail(user: { name: string; email: string }) {
  return sendEmail({
    to: user.email,
    subject: 'Account Activated Successfully',
    html: renderEmailTemplate({
      title: 'Account Activated',
      eyebrow: 'OnePWS Welcome',
      body: `Hello ${user.name}, your account has been successfully activated. You can now log in to the portal.`,
    }),
  });
}

export async function sendApprovalStatusEmail(user: { name: string; email: string; status: string }) {
  const isApproved = user.status === 'approved';
  const subject = isApproved
    ? 'Your OnePWS account is approved'
    : user.status === 'rejected'
      ? 'Your OnePWS access request was rejected'
      : user.status === 'blocked'
        ? 'Your OnePWS account has been blocked'
        : 'Your OnePWS account is pending review';

  const message = isApproved
    ? 'Your account has been approved. You can now sign in and access policy documents.'
    : user.status === 'rejected'
      ? 'Your account access request has been rejected. Please contact the admin team if you believe this needs review.'
      : user.status === 'blocked'
        ? 'Your account has been blocked and can no longer access the portal.'
        : 'Your account has been moved back to pending review.';

  return sendEmail({
    to: user.email,
    subject,
    html: renderEmailTemplate({
      title: subject,
      eyebrow: 'OnePWS account update',
      body: `Hello ${user.name}, ${message}`,
      rows: [['Current status', user.status]],
    }),
  });
}

export async function sendUserCreatedEmail(user: { name: string; email: string; password: string; status: string }) {
  return sendEmail({
    to: user.email,
    subject: 'Your OnePWS account has been created',
    html: renderEmailTemplate({
      title: 'Your account is ready',
      eyebrow: 'OnePWS access',
      body: 'An administrator created a OnePWS account for you. Sign in with the temporary password below and change it from your profile page.',
      rows: [
        ['Email', user.email],
        ['Temporary password', user.password],
        ['Status', user.status],
      ],
    }),
  });
}

export async function sendUserRemovedEmail(user: { name: string; email: string }) {
  return sendEmail({
    to: user.email,
    subject: 'Your OnePWS account was removed',
    html: renderEmailTemplate({
      title: 'Account removed',
      eyebrow: 'OnePWS account update',
      body: `Hello ${user.name}, your OnePWS account has been removed by an administrator.`,
    }),
  });
}

export async function sendPasswordResetEmail(user: { name: string; email: string; password: string }) {
  return sendEmail({
    to: user.email,
    subject: 'Your OnePWS password was reset',
    html: renderEmailTemplate({
      title: 'Password reset completed',
      eyebrow: 'OnePWS security update',
      body: 'An administrator reset your OnePWS password. Sign in with the temporary password below and change it from your profile page.',
      rows: [
        ['Email', user.email],
        ['Temporary password', user.password],
      ],
    }),
  });
}

export async function sendForgotPasswordEmail(user: { name: string; email: string; resetLink: string }) {
  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151">
      Hello ${escapeHtml(user.name)}, you requested to reset your OnePWS password. Click the button below to create a new password. This link expires in 1 hour.
    </p>
    <div style="margin:22px 0;text-align:center">
      <a href="${user.resetLink}" style="display:inline-block;background:#f87171;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
    </div>
    <p style="margin:22px 0 0;font-size:12px;color:#6b7280">Or paste this link in your browser: <br/><a href="${user.resetLink}" style="color:#0066cc;text-decoration:underline;word-break:break-all">${escapeHtml(user.resetLink)}</a></p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Reset your OnePWS password',
    html: `
      <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
        <div style="max-width:640px;margin:0 auto;padding:32px 18px">
          <div style="background:#111827;border-radius:8px 8px 0 0;padding:22px 26px;color:#ffffff">
            <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f87171;font-weight:700">OnePWS security update</div>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3">Password reset requested</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;padding:26px">
            ${bodyHtml}
            <p style="margin:22px 0 0;font-size:12px;color:#6b7280">This is an automated email from OnePWS.</p>
          </div>
        </div>
      </div>
    `,
  });
}

function renderEmailTemplate({
  title,
  eyebrow,
  body,
  rows = [],
}: {
  title: string;
  eyebrow: string;
  body: string;
  rows?: Array<[string, string]>;
}) {
  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">${escapeHtml(label)}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:600">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
      <div style="max-width:640px;margin:0 auto;padding:32px 18px">
        <div style="background:#111827;border-radius:8px 8px 0 0;padding:22px 26px;color:#ffffff">
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f87171;font-weight:700">${escapeHtml(eyebrow)}</div>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3">${escapeHtml(title)}</h1>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;padding:26px">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151">${escapeHtml(body)}</p>
          ${tableRows ? `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">${tableRows}</table>` : ''}
          <p style="margin:22px 0 0;font-size:12px;color:#6b7280">This is an automated email from OnePWS.</p>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
