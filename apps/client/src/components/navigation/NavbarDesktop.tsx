import { useAuth } from "@/hooks/use-auth";
import { getUrl } from "@hypertube/libs";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Logo } from "../images/Logo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserDropdown } from "../UserDropdown";

export const NavbarDesktop = () => {
  const { data } = useAuth();
  const user = data?.user;
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between bg-sidebar p-2">
      <div className="flex flex-1 justify-start">
        <Link to={getUrl("client-home")}>
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <Search />
        <Input placeholder={t("navbar.placeholder")} />
      </div>
      <div className="flex flex-1 justify-end">
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
