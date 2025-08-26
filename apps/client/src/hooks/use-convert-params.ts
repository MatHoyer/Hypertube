import { useParams } from "react-router-dom";
import type { ZodType } from "zod";

export const useConvertParams = <T extends Record<string, unknown>>(
  schema: ZodType<T>
): T => {
  const params = useParams();
  return schema.parse(params);
};
