import { TUserSchema } from "@hypertube/libs";
import i18next from "i18next";
import { sendEmail } from "../lib/mail";
import { mailTemplate } from "./import-template";

type TSendVerificationEmail = {
  user: TUserSchema;
  url: string;
  callbackURL: string;
};

export const sendVerificationEmail = async (input: TSendVerificationEmail) => {
  const { user, url, callbackURL } = input;

  const newUrl = new URL(url);
  newUrl.searchParams.set("callbackURL", callbackURL);

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
