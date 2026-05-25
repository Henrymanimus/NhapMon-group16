import nodemailer from "nodemailer";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { ApiError } from "../../errors/api-error";

type SendPasswordResetOtpInput = {
  to: string;
  otp: string;
  tenDangNhap: string;
  expiresInMinutes: number;
};

let transporter: nodemailer.Transporter | null = null;

function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

function getFromAddress() {
  return env.SMTP_FROM ?? env.SMTP_USER ?? "Nha Tro Pro <no-reply@example.com>";
}

export async function sendPasswordResetOtpEmail(input: SendPasswordResetOtpInput) {
  const mailer = getTransporter();

  if (!mailer) {
    logger.warn(
      { to: input.to, tenDangNhap: input.tenDangNhap },
      "SMTP is not configured; password reset OTP is written to server log"
    );
    return;
  }

  try {
    const info = await mailer.sendMail({
      from: getFromAddress(),
      to: input.to,
      subject: "Ma OTP dat lai mat khau Nha Tro Pro",
      text: [
        `Ma OTP dat lai mat khau cua ban la: ${input.otp}`,
        `Ma co hieu luc trong ${input.expiresInMinutes} phut.`,
        "Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 12px;">Dat lai mat khau Nha Tro Pro</h2>
          <p>Ma OTP dat lai mat khau cua ban la:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${input.otp}</p>
          <p>Ma co hieu luc trong <strong>${input.expiresInMinutes} phut</strong>.</p>
          <p style="color: #6b7280;">Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.</p>
        </div>
      `,
    });

    logger.info(
      { to: input.to, messageId: info.messageId },
      "Password reset OTP email sent"
    );
  } catch (err) {
    logger.error({ err, to: input.to }, "Failed to send password reset OTP email");
    throw new ApiError(
      502,
      "OTP_EMAIL_SEND_FAILED",
      "Khong gui duoc ma OTP qua email. Vui long kiem tra cau hinh SMTP."
    );
  }
}
