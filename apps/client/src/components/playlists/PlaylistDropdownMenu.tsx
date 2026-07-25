import { PlaylistList } from "@/pages/library/components/PlaylistList";
import { EllipsisVertical, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { openDialog } from "../dialogs/dialog.store";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Typography } from "../ui/typography";

export const PlaylistDropdownMenu: React.FC<{
  movie: { details: { id: number } };
}> = ({ movie }) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="icon">
          <EllipsisVertical size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[208px]" side="top" align="start">
        <DropdownMenuLabel>
          <Typography textSize="lg">{t("playlist.save")}</Typography>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <PlaylistList movie={movie} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setIsDropdownOpen(false);
            setTimeout(() => openDialog("playlist"), 200);
          }}
        >
          <Plus />
          {t("playlist.new")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
