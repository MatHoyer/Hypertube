import type { ZodObject, ZodRawShape } from "zod";
import z from "zod";

const paginationSearchParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});
type TPaginationSearchParams = typeof paginationSearchParams.shape;

const paginationResponse = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
type TPaginationResponse = typeof paginationResponse.shape;

export const getPaginationSchemas = <
  TUrlParams extends ZodRawShape | undefined = undefined,
  TSearchParams extends ZodRawShape | undefined = undefined,
  TRequirements extends ZodRawShape | undefined = undefined,
  TResponse extends ZodRawShape = ZodRawShape
>({
  urlParams,
  searchParams,
  requirements,
  response,
}: {
  urlParams?: ZodObject<TUrlParams extends ZodRawShape ? TUrlParams : any>;
  searchParams?: ZodObject<
    TSearchParams extends ZodRawShape ? TSearchParams : any
  >;
  requirements?: ZodObject<
    TRequirements extends ZodRawShape ? TRequirements : any
  >;
  response: ZodObject<TResponse>;
}) => {
  return {
    ...(urlParams && { urlParams }),
    searchParams: searchParams
      ? z.object({ ...searchParams.shape, ...paginationSearchParams.shape })
      : paginationSearchParams,
    ...(requirements && { requirements }),
    response: z.object({ ...response.shape, ...paginationResponse.shape }),
  } as any as (TUrlParams extends ZodRawShape
    ? { urlParams: ZodObject<TUrlParams> }
    : {}) & {
    searchParams: ZodObject<
      (TSearchParams extends ZodRawShape ? TSearchParams : {}) &
        TPaginationSearchParams
    >;
  } & (TRequirements extends ZodRawShape
      ? { requirements: ZodObject<TRequirements> }
      : {}) & { response: ZodObject<TResponse & TPaginationResponse> };
};
