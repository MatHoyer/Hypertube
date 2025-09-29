import { Typography } from "@/components/ui/typography";
import { useMouse } from "@/hooks/use-mouse";
import { cn } from "@/lib/utils";
import { getUrl } from "@hypertube/libs";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { mouseIn } = useMouse(ref);
  const navigate = useNavigate();

  return (
    <div className="relative h-[calc(100dvh-65px)] overflow-hidden">
      <div className="absolute flex justify-center items-center inset-0">
        <div
          className="z-10 size-52 rounded-full text-center content-center select-none bg-primary/60 backdrop-blur-sm"
          ref={ref}
          onClick={() => navigate(getUrl("client-home"))}
        >
          <Typography variant="h1">404</Typography>
          <Typography variant="h3">{t("global.homepage")}</Typography>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col size-full justify-center items-center transition-all animate-spin",
          mouseIn ? "gap-0" : "gap-60"
        )}
        style={{ animationDuration: "15s" }}
      >
        <img
          src="/images/404/404top.svg"
          className="select-none"
          draggable={false}
          width={50}
          height={50}
        />
        <img
          src="/images/404/404bottom.svg"
          className="select-none"
          draggable={false}
          width={50}
          height={50}
        />
      </div>
    </div>
  );
};
