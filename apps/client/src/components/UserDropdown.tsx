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
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageAvatar } from "./images/Avatar";
import { Typography } from "./ui/typography";

export const UserDropdown = () => {
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
          <div className="grid flex-1 text-left">
            <Typography>{session.data?.user.name}</Typography>
            <Typography>{session.data?.user.email}</Typography>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{t("navbar.account")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User /> {t("navbar.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings /> {t("navbar.settings")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="bg-destructive"
          onClick={() => authClient.signOut()}
        >
          <LogOut />
          {t("sign.out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
