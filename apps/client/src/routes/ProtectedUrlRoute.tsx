import { NotFoundPage } from "@/pages/notFound/NotFound.page";
import { Outlet, useParams } from "react-router-dom";
import type { ZodType } from "zod";

export const ProtectedUrlRoute = <T extends Record<string, unknown>>({
  schema,
}: {
  schema: ZodType<T>;
}) => {
  const params = useParams();
  const result = schema.safeParse(params);

  if (!result.success) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};
