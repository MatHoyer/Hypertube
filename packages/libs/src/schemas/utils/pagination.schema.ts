import type { ZodObject, ZodRawShape } from "zod";
import z from "zod";

const paginationSearchParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});
type TPaginationSearchParams = typeof paginationSearchParams.shape;

const getPaginationSearchParams = ({
  withPageSize,
}: {
  withPageSize?: boolean;
}) => {
  if (!withPageSize) {
    return z.object({ page: paginationSearchParams.shape.page });
  }
  return paginationSearchParams;
};

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

type TPaginationSearchParamsSchemas<TSearchParams, TWithPageSize> = {
  searchParams: ZodObject<
    (TSearchParams extends ZodRawShape ? TSearchParams : {}) &
      (TWithPageSize extends true
        ? TPaginationSearchParams
        : Record<"page", TPaginationSearchParams["page"]>)
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
  TResponse,
  TWithPageSize
> = TPaginationUrlParamsSchemas<TUrlParams> &
  TPaginationSearchParamsSchemas<TSearchParams, TWithPageSize> &
  TPaginationRequirementsSchemas<TRequirements> &
  TPaginationResponseSchemas<TResponse>;

export const getPaginationSchemas = <
  TUrlParams extends ZodRawShape | undefined = undefined,
  TSearchParams extends ZodRawShape | undefined = undefined,
  TRequirements extends ZodRawShape | undefined = undefined,
  TResponse extends ZodRawShape = ZodRawShape,
  TWithPageSize extends boolean = true
>({
  urlParams,
  searchParams,
  requirements,
  response,
  options = { withPageSize: true as TWithPageSize },
}: {
  urlParams?: ZodObject<TUrlParams extends ZodRawShape ? TUrlParams : never>;
  searchParams?: ZodObject<
    TSearchParams extends ZodRawShape ? TSearchParams : never
  >;
  requirements?: ZodObject<
    TRequirements extends ZodRawShape ? TRequirements : never
  >;
  response: ZodObject<TResponse>;
  options?: { withPageSize?: TWithPageSize };
}) => {
  return {
    urlParams,
    searchParams: searchParams
      ? z.object({
          ...searchParams.shape,
          ...getPaginationSearchParams({ withPageSize: options.withPageSize })
            .shape,
        })
      : getPaginationSearchParams({ withPageSize: options.withPageSize }),
    requirements,
    response: z.object({ ...response.shape, ...paginationResponse.shape }),
  } as any as TPaginationSchemasReturn<
    TUrlParams,
    TSearchParams,
    TRequirements,
    TResponse,
    TWithPageSize
  >;
};
