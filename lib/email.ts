import { Resend } from "resend";

/** Password-reset delivery only. Guardian email was retired with the 15–18 MVP. */
export async function sendResetEmail(input: { to: string; token: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email delivery is not configured.");

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(input.token)}`;
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "GROW <onboarding@resend.dev>",
    to: input.to,
    subject: "Reset your GROW password",
    html: `<p>You requested a password reset for GROW.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour. If you did not request it, you can ignore this email.</p>`,
  });
  if (result.error) throw new Error("Email provider rejected the password-reset message.");
}
