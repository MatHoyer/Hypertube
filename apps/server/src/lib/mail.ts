import { env } from "@hypertube/server-core";
import nodemailer from "nodemailer";

export type SendEmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

const createTransport = () => {
  let auth: { user: string; pass: string } | undefined;

  if (env.MAIL_SMTP_USER && env.MAIL_SMTP_PASSWORD) {
    auth = {
      user: env.MAIL_SMTP_USER,
      pass: env.MAIL_SMTP_PASSWORD,
    };
  }

  return nodemailer.createTransport({
    host: env.MAIL_SMTP_HOST,
    port: env.MAIL_SMTP_PORT,
    secure: env.MAIL_SMTP_SECURE,
    ...(auth ? { auth } : {}),
  });
};

const transport = createTransport();

export const sendEmail = async (payload: SendEmailPayload) => {
  await transport.sendMail({
    from: payload.from ?? env.MAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
};
