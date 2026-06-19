import { TUserSchema } from "@hypertube/libs";
import { ICacheService } from "@hypertube/server-core";
import { APIError } from "better-auth/api";
import i18next from "i18next";
import { sendEmail } from "../lib/mail";
import { mailTemplate } from "./import-template";

type TSendDeleteVerification = {
  user: TUserSchema;
  url: string;
  callbackURL: string;
};

export const sendDeleteVerification =
  (cacheService: ICacheService) => async (input: TSendDeleteVerification) => {
    const { user, url, callbackURL } = input;

    const hasCooldown = await cacheService.has(`delete:${user.id}`);
    if (hasCooldown) {
      throw new APIError("TOO_MANY_REQUESTS", {
        code: "TOO_MANY_EMAILS_SENT",
      });
    }

    const newUrl = new URL(url);
    newUrl.searchParams.set("callbackURL", callbackURL);

    cacheService.set(`delete:${user.id}`, 1, 5 * 60);

    await sendEmail({
      to: user.email,
      subject: i18next.t("email.userDeletion.confirmDelete"),
      html: mailTemplate({
        title: i18next.t("email.userDeletion.confirmDelete"),
        content: "",
        link: newUrl.href,
        linkText: i18next.t("email.userDeletion.delete"),
      }),
    });
  };
