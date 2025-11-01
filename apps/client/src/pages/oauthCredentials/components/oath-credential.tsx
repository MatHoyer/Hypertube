import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { TGetCredentialsSchemas } from "@hypertube/libs";
import type React from "react";

export const OathCredential: React.FC<{
  credential: TGetCredentialsSchemas["response"][number];
}> = ({ credential }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{credential.clientId}</CardTitle>
      </CardHeader>
      <CardContent>
        <Typography></Typography>
      </CardContent>
    </Card>
  );
};
