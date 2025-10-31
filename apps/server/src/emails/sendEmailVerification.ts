import { newUTCDate, TUserSchema } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { APIError } from "better-auth/api";
import { addMinutes, isBefore } from "date-fns";
import i18next from "i18next";
import { sendEmail } from "../lib/resend";
import { mailTemplate } from "./import-template";

export const sendVerificationEmail = async ({
  user,
  url,
  callbackURL,
}: {
  user: TUserSchema;
  url: string;
  callbackURL: string;
}) => {
  if (isBefore(newUTCDate(), user.emailCooldown)) {
    throw new APIError("TOO_MANY_REQUESTS", {
      code: "TOO_MANY_EMAILS_SENT",
    });
  }

  const newUrl = new URL(url);
  newUrl.searchParams.set("callbackURL", callbackURL);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailCooldown: addMinutes(newUTCDate(), 5),
    },
  });

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
