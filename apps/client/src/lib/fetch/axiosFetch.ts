import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { ZodError, type ZodType, type infer as zInfer } from "zod";

type TAxiosFetch<T extends ZodType<TT>, TT, D extends ZodType<DD>, DD> = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  config?: AxiosRequestConfig;
  url: string;
  schemas: {
    requirements?: T;
    response: D;
  };
  data?: zInfer<T>;
  handleEnding?: {
    successMessage?: string;
    errorMessage?: string;
    cb?: (res: zInfer<D>) => void | Promise<void>;
  };
};

const serverUrl = import.meta.env.PUBLIC_SERVER_URL;

export const axiosFetch = async <
  T extends ZodType<TT>,
  TT,
  D extends ZodType<DD>,
  DD,
>({
  method,
  config,
  url,
  schemas,
  data,
  handleEnding,
}: TAxiosFetch<T, TT, D, DD>): Promise<zInfer<D>> => {
  try {
    if (schemas.requirements) {
      schemas.requirements.parse(data);
    }

    const res = await axios({
      method,
      url: serverUrl + url,
      data,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      ...config,
    });

    const response = schemas.response.parse(res.data);
    if (handleEnding?.successMessage) {
      console.log(handleEnding.successMessage);
    }
    handleEnding?.cb?.(response);

    return response;
  } catch (error) {
    let errorStr = "unknown error";
    if (axios.isAxiosError(error) && error.response) {
      console.log(error.response.data.message);
      errorStr = error.response.data.message;
    } else if (error instanceof ZodError) {
      const zerrjson = JSON.parse(error.message) as {
        message: string;
        path: string[];
      }[];

      const zerr = {
        message: zerrjson[0].message,
        path: zerrjson[0].path[0],
      };

      console.log("Zod validation error:", zerr.message, "at", zerr.path);
      errorStr = zerr.message;
    } else {
      console.log(error);
    }
    throw new Error(errorStr, { cause: error });
  }
};
