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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { File, LogOut, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UserImageAvatar } from "./images/Avatar";

export const UserDropdown = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-60">
        {
          <Button variant="ghost" className="rounded-full size-fit p-0">
            <UserImageAvatar />
          </Button>
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{t("navbar.account")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={"#"}>
              <User /> {t("navbar.profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={getUrl("client-settings")}>
              <Settings /> {t("navbar.settings")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to={getUrl("api-swagger", { mode: "ui", withServerUrl: true })}
            target="_blank"
          >
            <File /> API
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="bg-destructive"
          onClick={() => signOutMutation.mutate()}
        >
          <LogOut />
          {t("sign.out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
