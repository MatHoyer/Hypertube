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
import { useIsMobile } from "@/hooks/use-mobile";
import { useRequiredUser } from "@/hooks/use-required-user";
import { authClient } from "@/lib/auth-client";
import { getUrl } from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, File, LogOut, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserImageAvatar } from "./images/Avatar";
import { Typography } from "./ui/typography";

export const UserDropdown = () => {
  const user = useRequiredUser();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      <DropdownMenuTrigger asChild>
        {isMobile ? (
          <Button variant="ghost" className="rounded-full size-fit p-0">
            <UserImageAvatar />
          </Button>
        ) : (
          <Button variant="outline" className="p-6" size="lg">
            <UserImageAvatar />
            <div className="grid flex-1 text-left">
              <Typography>{user.name}</Typography>
              <Typography>{user.email}</Typography>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{t("navbar.account")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("#")}>
            <User /> {t("navbar.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(getUrl("client-settings"))}>
            <Settings /> {t("navbar.settings")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            // Do not use navigate because we need to reload the page to see the swagger UI
            (document.location.href = getUrl("api-swagger", {
              mode: "ui",
              withServerUrl: true,
            }))
          }
        >
          <File /> API
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
