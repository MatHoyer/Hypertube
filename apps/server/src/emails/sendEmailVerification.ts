import { TUserSchema } from "@hypertube/libs";
import { getRedisBetterAuth } from "@hypertube/server-core";
import { APIError } from "better-auth/api";
import i18next from "i18next";
import { sendEmail } from "../lib/mail";
import { mailTemplate } from "./import-template";

const redisBetterAuth = getRedisBetterAuth();

const setEmailCooldown = (id: string) => {
  redisBetterAuth.set(`${id}:email`, 1, "EX", 5 * 60);
};

const hasEmailCooldown = async (id: string) => {
  return !!(await redisBetterAuth.get(`${id}:email`));
};

export const sendVerificationEmail = async ({
  user,
  url,
  callbackURL,
}: {
  user: TUserSchema;
  url: string;
  callbackURL: string;
}) => {
  const hasCooldown = await hasEmailCooldown(user.id);
  if (hasCooldown) {
    throw new APIError("TOO_MANY_REQUESTS", {
      code: "TOO_MANY_EMAILS_SENT",
    });
  }

  const newUrl = new URL(url);
  newUrl.searchParams.set("callbackURL", callbackURL);

  setEmailCooldown(user.id);

  await sendEmail({
    to: user.email,
    subject: i18next.t("email.verification.confirmEmail"),
    html: mailTemplate({
      title: i18next.t("email.verification.confirmEmail"),
      content: "",
      link: newUrl.href,
      linkText: i18next.t("email.verification.confirm"),
    }),
  });
};
