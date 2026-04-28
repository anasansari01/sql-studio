import nodemailer from "nodemailer";
import { google } from "googleapis";

function getOAuth2Client() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      "Missing Google OAuth2 credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in .env.local"
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return oauth2Client;
}

async function createTransporter() {
  const oauth2Client = getOAuth2Client();

  const { token: accessToken } = await oauth2Client.getAccessToken();
  if (!accessToken) throw new Error("Failed to obtain Gmail access token.");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER!,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
      accessToken,
    },
  });
}

const APP_NAME = "SQL Studio";
const FROM = `"${APP_NAME}" <${process.env.GMAIL_USER}>`;
const OTP_EXPIRY_MINUTES = 10;

function otpEmailHtml(code: string, purpose: string): string {
  const purposeLabels: Record<string, { title: string; subtitle: string }> = {
    register: {
      title: "Verify your email",
      subtitle: "Enter this code to complete your registration.",
    },
    login: {
      title: "Your login verification code",
      subtitle: "Enter this code to finish signing in.",
    },
    reset_password: {
      title: "Reset your password",
      subtitle: "Enter this code to reset your password.",
    },
  };

  const { title, subtitle } = purposeLabels[purpose] ?? purposeLabels.login;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
             style="background:#1c2230;border:1px solid #30363d;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#6366f1;padding:28px 40px;text-align:center;">
            <span style="display:inline-block;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              <span style="color:#c7d2fe;">SQL</span> Studio
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#e6edf3;">${title}</h1>
            <p style="margin:0 0 32px;font-size:14px;color:#8b949e;line-height:1.6;">${subtitle}</p>

            <!-- OTP code box -->
            <div style="background:#0f1117;border:1px solid #30363d;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
              <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#818cf8;font-family:'Courier New',Courier,monospace;">
                ${code}
              </span>
            </div>

            <p style="margin:0;font-size:13px;color:#484f58;line-height:1.7;">
              This code expires in <strong style="color:#8b949e;">${OTP_EXPIRY_MINUTES} minutes</strong>.<br/>
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #21262d;">
            <p style="margin:0;font-size:12px;color:#484f58;text-align:center;">
              ${APP_NAME} · Sent to ${"{email}"}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendOtpEmail(
  toEmail: string,
  code: string,
  purpose: "register" | "login" | "reset_password"
): Promise<void> {
  const subjectMap = {
    register:       `${code} — Verify your ${APP_NAME} account`,
    login:          `${code} — Your ${APP_NAME} login code`,
    reset_password: `${code} — Reset your ${APP_NAME} password`,
  };

  const transporter = await createTransporter();

  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: subjectMap[purpose],
    html: otpEmailHtml(code, purpose).replace("{email}", toEmail),
    text: `Your ${APP_NAME} verification code is: ${code}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  });
}