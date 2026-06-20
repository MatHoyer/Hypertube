import { getUrl, ROUTES } from "@hypertube/libs";
import { APIError, User } from "better-auth";
import i18next from "i18next";
import { sendEmail } from "../lib/mail";
import { mailTemplate } from "./import-template";

type TSendResetPassword = { user: User; url: string };

export const sendResetPassword = async (input: TSendResetPassword) => {
  const { user, url } = input;
  const tokenUrl = new URL(url);
  const token = tokenUrl.pathname.split("/").pop();

  if (!token) {
    throw new APIError("BAD_REQUEST", {
      code: "INVALID_TOKEN",
    });
  }

  const newUrl = getUrl(ROUTES.CLIENT.RESET_PASSWORD, {
    withUrl: "client",
    searchParams: { token },
  });

  await sendEmail({
    to: user.email,
    subject: i18next.t("email.password.resetPassword"),
    html: mailTemplate({
      title: i18next.t("email.password.resetPassword"),
      content: "",
      link: newUrl,
      linkText: i18next.t("email.password.reset"),
    }),
  });
};
