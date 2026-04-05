import { env } from "@hypertube/server-core";
import nodemailer from "nodemailer";
import { Resend } from "resend";

export type SendEmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

const mailpitTransport =
  env.MAIL_PROVIDER === "mailpit"
    ? nodemailer.createTransport({
        host: env.MAILPIT_SMTP_HOST,
        port: env.MAILPIT_SMTP_PORT,
        secure: false,
      })
    : null;

let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

export const sendEmail = async (payload: SendEmailPayload) => {
  if (env.MAIL_PROVIDER === "mailpit") {
    await mailpitTransport!.sendMail({
      from:
        payload.from ??
        env.RESEND_API_EMAIL_FROM ??
        "Hypertube <noreply@localhost>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return;
  }

  return getResend().emails.send({
    from: payload.from ?? env.RESEND_API_EMAIL_FROM!,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
};
