import { Logo } from "@/components/images/Logo";
import { Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full flex flex-col md:flex-row items-center bg-sidebar rounded-lg p-2">
      <div className="flex flex-col items-center justify-center">
        <Logo size="lg" />
        <Typography variant="h3">Hypertube</Typography>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-around w-full gap-2">
        <Button variant="link" asChild>
          <Link to="https://github.com/MatHoyer/Hypertube" target="_blank">
            {t("footer.sourceCode")}
          </Link>
        </Button>
        <div className="flex flex-col">
          <Typography variant="h3">{t("footer.providers")}</Typography>
          <Button variant="link" asChild>
            <Link to="#" target="_blank">
              YTS
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-dvh w-dvw bg-background overflow-hidden">
      <header className="h-[65px] w-full">
        <Navbar />
      </header>
      <ScrollArea className="h-[calc(100dvh-65px)] w-full">
        <main className="min-h-[calc(100dvh-65px)]">{children}</main>
        <Footer />
      </ScrollArea>
    </div>
  );
};
