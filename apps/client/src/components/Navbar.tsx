import { authClient } from "@/lib/auth-client";
import { getUrl } from "@hypertube/libs";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UserDropdown } from "./UserDropdown";

export const Navbar = () => {
  const session = authClient.useSession();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between bg-sidebar">
      <div className="flex flex-1 justify-start">
        <Link to={getUrl("client-home")}>
          <img
            src="/images/Hypertube_logo.png"
            alt="Hypertube Logo"
            className="size-10 md:size-16"
          />
        </Link>
      </div>
      <div className="flex flex-[2] md:flex-1 items-center gap-2">
        <Search />
        <Input placeholder={t("navbar.placeholder")} />
      </div>
      <div className="flex flex-1 justify-end">
        {session.data?.user ? (
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
