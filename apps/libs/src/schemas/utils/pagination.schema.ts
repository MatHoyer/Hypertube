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

type TPaginationUrlParamsSchemas<TUrlParams> = TUrlParams extends ZodRawShape
  ? { urlParams: ZodObject<TUrlParams> }
  : {};

type TPaginationSearchParamsSchemas<TSearchParams> = {
  searchParams: ZodObject<
    (TSearchParams extends ZodRawShape ? TSearchParams : {}) &
      TPaginationSearchParams
  >;
};

type TPaginationRequirementsSchemas<TRequirements> =
  TRequirements extends ZodRawShape
    ? { requirements: ZodObject<TRequirements> }
    : {};

type TPaginationResponseSchemas<TResponse> = {
  response: ZodObject<TResponse & TPaginationResponse>;
};

type TPaginationSchemasReturn<
  TUrlParams,
  TSearchParams,
  TRequirements,
  TResponse
> = TPaginationUrlParamsSchemas<TUrlParams> &
  TPaginationSearchParamsSchemas<TSearchParams> &
  TPaginationRequirementsSchemas<TRequirements> &
  TPaginationResponseSchemas<TResponse>;

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
  urlParams?: ZodObject<TUrlParams extends ZodRawShape ? TUrlParams : never>;
  searchParams?: ZodObject<
    TSearchParams extends ZodRawShape ? TSearchParams : never
  >;
  requirements?: ZodObject<
    TRequirements extends ZodRawShape ? TRequirements : never
  >;
  response: ZodObject<TResponse>;
}) => {
  return {
    urlParams,
    searchParams: searchParams
      ? z.object({ ...searchParams.shape, ...paginationSearchParams.shape })
      : paginationSearchParams,
    requirements,
    response: z.object({ ...response.shape, ...paginationResponse.shape }),
  } as any as TPaginationSchemasReturn<
    TUrlParams,
    TSearchParams,
    TRequirements,
    TResponse
  >;
};
