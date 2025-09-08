import { getUrl } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Input } from "./ui/input";
import { UserDropdown } from "./UserDropdown";

export const Navbar = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 justify-start">
        <Link to={getUrl("client-home")}>
          <img
            src="/images/Hypertube_logo.png"
            alt="Hypertube Logo"
            width={64}
            height={64}
          />
        </Link>
      </div>
      <div className="flex-1">
        <Input placeholder={t("navbar.placeholder")} />
      </div>
      <div className="flex flex-1 justify-end">
        <UserDropdown />
      </div>
    </div>
  );
};
