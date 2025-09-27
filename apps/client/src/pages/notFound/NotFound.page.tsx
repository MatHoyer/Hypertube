import { Typography } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const len = 50;
  return (
    <div className="relative flex flex-col justify-center items-center h-[calc(100dvh-65px)] overflow-hidden">
      <div
        className="absolute size-52 rounded-full text-center content-center select-none bg-primary/60 backdrop-blur-sm"
        onClick={() => {
          console.log("go back to homepage");
        }}
      >
        <Typography variant="h1">404</Typography>
        <Typography variant="h3">{t("global.homepage")}</Typography>
      </div>
      <img
        src="/images/404/404top.svg"
        className="select-none"
        draggable={false}
        width={len}
        height={len}
      />
      <img
        src="/images/404/404bottom.svg"
        className="select-none"
        draggable={false}
        width={len}
        height={len}
      />
    </div>
  );
};
