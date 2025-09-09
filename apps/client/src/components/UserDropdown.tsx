import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getUrl } from "@hypertube/libs";
import { ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ImageAvatar } from "./images/Avatar";

export function UserDropdown() {
  const session = authClient.useSession();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="p-6" size="lg">
          <ImageAvatar
            name={session.data?.user.name ?? ""}
            imageSrc={session.data?.user.image ?? ""}
            size="sm"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {session.data?.user.name}
            </span>
            <span className="truncate text-xs">{session.data?.user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{t("navbar.account")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>{t("navbar.profile")}</DropdownMenuItem>
          <DropdownMenuItem>{t("navbar.settings")}</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        {session.data?.user && (
          <DropdownMenuItem onClick={() => authClient.signOut()}>
            {t("sign.out")}
          </DropdownMenuItem>
        )}
        {!session.data?.user && (
          <DropdownMenuItem asChild>
            <Link to={getUrl("client-signin")}>{t("sign.in")}</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
