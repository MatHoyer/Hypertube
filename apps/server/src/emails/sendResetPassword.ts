import { getUrl, ROUTES, TUserSchema } from "@hypertube/libs";
import { ICacheService } from "@hypertube/server-core";
import { APIError } from "better-auth";
import i18next from "i18next";
import { sendEmail } from "../lib/mail";
import { mailTemplate } from "./import-template";

type TSendResetPassword = { user: TUserSchema; url: string };

export const sendResetPassword =
  (cacheService: ICacheService) => async (input: TSendResetPassword) => {
    const { user, url } = input;

    const userInfo = user as TUserSchema;
    const hasCooldown = await cacheService.has(`password:${user.id}`);
    if (hasCooldown) {
      throw new APIError("TOO_MANY_REQUESTS", {
        code: "TOO_MANY_EMAILS_SENT",
      });
    }

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

    cacheService.set(`password:${user.id}`, 1, 5 * 60);

    void sendEmail({
      to: userInfo.email,
      subject: i18next.t("email.password.resetPassword"),
      html: mailTemplate({
        title: i18next.t("email.password.resetPassword"),
        content: "",
        link: newUrl,
        linkText: i18next.t("email.password.reset"),
      }),
    });
  };
