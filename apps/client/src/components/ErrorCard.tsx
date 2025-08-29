import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { CircleAlert } from "lucide-react";

export const ErrorCard: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => {
  return (
    <Card className="flex gap-0 py-0 light bg-background">
      <div className="flex items-center justify-center">
        <Typography
          variant="h3"
          className="flex items-center gap-2 mt-5 text-destructive"
        >
          <CircleAlert />
          {title}
        </Typography>
      </div>
      <Typography variant="p" className="flex m-5">
        {message}
      </Typography>
    </Card>
  );
};
