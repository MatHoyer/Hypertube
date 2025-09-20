import { getUrl } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Logo } from "../images/Logo";
import { Input } from "../ui/input";
import { UserDropdown } from "../UserDropdown";

export const NavbarMobile = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between bg-sidebar gap-4 p-2 h-full">
      <Link to={getUrl("client-home")}>
        <Logo />
      </Link>
      <div className="flex flex-1 w-full items-center">
        <Input placeholder={t("navbar.placeholder")} />
      </div>
      <UserDropdown />
    </div>
  );
};
