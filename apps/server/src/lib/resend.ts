import { Resend } from "resend";
import { env } from "../env.js";

const resend = new Resend(env.RESEND_API_KEY);

type ResendSendType = typeof resend.emails.send;
type ResendParamsType = Parameters<ResendSendType>;
type ResendParamsTypeWithConditionalFrom = [
  payload: Omit<ResendParamsType[0], "from"> & { from?: string },
  options?: ResendParamsType[1]
];

export const sendEmail = async (
  ...params: ResendParamsTypeWithConditionalFrom
) => {
  if (env.NODE_ENV === "DEV") {
    params[0].subject = `[DEV] ${params[0].subject}`;
  }
  const resendParams = [
    {
      ...params[0],
      from: params[0].from ?? env.RESEND_API_EMAIL_FROM,
      to: env.NODE_ENV === "DEV" ? env.RESEND_API_EMAIL_TO : params[0].to,
    } as ResendParamsType[0],
    params[1],
  ] satisfies ResendParamsType;

  const result = await resend.emails.send(...resendParams);

  return result;
};
