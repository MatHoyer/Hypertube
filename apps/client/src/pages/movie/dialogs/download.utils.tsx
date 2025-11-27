import { Card, CardContent } from "@/components/ui/card";
import type { PropsWithChildren } from "react";

export const DownloadResourceDisplay: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-2">
        {children}
      </CardContent>
    </Card>
  );
};
