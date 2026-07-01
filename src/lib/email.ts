import nodemailer from "nodemailer";

// ── Email transport ──────────────────────────────────────────────────────────
// Uses Gmail SMTP. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
// For Gmail: enable 2FA → generate App Password at myaccount.google.com/apppasswords
function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "";

// ── Send new-user notification to admin ──────────────────────────────────────
export async function sendNewUserNotification(user: {
  name?: string | null;
  email: string;
  createdAt: Date;
  provider?: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log("[email] Skipping — GMAIL_USER or GMAIL_APP_PASSWORD not set");
    return;
  }

  try {
    await getTransport().sendMail({
      from: `"Craft-A-Holic Mom" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🆕 New Member: ${user.name || user.email}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#fff;">
          <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
            <h2 style="color:#be185d;margin:0 0 4px;">🆕 New Member Registered</h2>
            <p style="color:#9d174d;margin:0;font-size:13px;">Craft-A-Holic Mom · Card Collector Platform</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 0;color:#6b7280;width:120px;">Name</td>
              <td style="padding:10px 0;font-weight:600;color:#111;">${user.name || "—"}</td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">Email</td>
              <td style="padding:10px 0;font-weight:600;color:#111;">${user.email}</td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">Joined</td>
              <td style="padding:10px 0;color:#111;">${new Date(user.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">Sign-up via</td>
              <td style="padding:10px 0;color:#111;">${user.provider || "Email"}</td>
            </tr>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="${process.env.NEXTAUTH_URL || "https://pcgcardlistingroot.vercel.app"}/admin"
               style="background:#be185d;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:13px;">
              View All Members →
            </a>
          </div>
          <p style="font-size:11px;color:#d1d5db;margin-top:24px;text-align:center;">
            Craft-A-Holic Mom Admin · This is an automated notification
          </p>
        </div>
      `,
    });
    console.log(`[email] New user notification sent for ${user.email}`);
  } catch (err) {
    console.error("[email] Failed to send notification:", err);
  }
}

// ── Send welcome email to new user ───────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name?: string | null) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  try {
    await getTransport().sendMail({
      from: `"Craft-A-Holic Mom" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Welcome to Craft-A-Holic Mom! 🧶",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#fff;">
          <div style="text-align:center;padding:20px 0 16px;">
            <div style="font-size:40px;">🧶</div>
            <h1 style="color:#be185d;font-size:22px;margin:8px 0 4px;">Welcome${name ? `, ${name}` : ""}!</h1>
            <p style="color:#9d174d;font-size:13px;">You're now part of Craft-A-Holic Mom</p>
          </div>
          <p style="color:#374151;font-size:14px;line-height:1.7;">
            Thanks for joining! You can now browse the shop, track TCG card prices, 
            build your watchlist, and trade or sell cards with other collectors.
          </p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${process.env.NEXTAUTH_URL || "https://pcgcardlistingroot.vercel.app"}/dashboard"
               style="background:#be185d;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
              Go to Your Dashboard →
            </a>
          </div>
          <p style="font-size:11px;color:#d1d5db;text-align:center;margin-top:24px;">
            Craft-A-Holic Mom · Handmade with love
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send welcome email:", err);
  }
}
