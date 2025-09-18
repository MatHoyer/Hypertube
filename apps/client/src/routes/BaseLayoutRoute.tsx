import { BaseLayout } from "@/layouts/BaseLayout";
import { Outlet } from "react-router-dom";

export const BaseLayoutRoute = () => {
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
};
