import { useAuth } from "@/hooks/use-auth";
import { getUrl } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FlagCombobox } from "../flags/FlagCombobox";
import { Logo } from "../images/Logo";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Button } from "../ui/button";
import { UserDropdown } from "../UserDropdown";

export const Navbar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between bg-sidebar gap-4 p-2 h-full">
      <div className="flex justify-start md:flex-1 md:pl-4">
        <Link to={getUrl("client-home")}>
          <Logo />
        </Link>
      </div>
      <div className="flex justify-end items-center md:flex-1 gap-2 md:pr-4">
        <ThemeToggle />
        <FlagCombobox />
        {user ? (
          <UserDropdown />
        ) : (
          <Button asChild>
            <Link to={getUrl("client-signin")}>{t("sign.in")}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};
