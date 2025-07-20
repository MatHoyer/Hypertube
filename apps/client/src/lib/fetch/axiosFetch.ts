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

export const axiosFetch = async <
  T extends ZodType<TT>,
  TT,
  D extends ZodType<DD>,
  DD
>({
  method,
  config = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  },
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
      url,
      data,
      ...config,
    });

    const response = schemas.response.parse(res.data);
    if (handleEnding?.successMessage) {
      console.log(handleEnding.successMessage);
    }
    handleEnding?.cb?.(response);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(error.response.data.message);
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
    } else {
      console.log(error);
    }
    throw error;
  }
};
