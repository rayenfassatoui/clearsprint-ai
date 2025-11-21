import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, url: string) => {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured. Mocking email send.');
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${url}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ClearSprint AI" <noreply@clearsprint.ai>',
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset for your ClearSprint AI account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  });
};
