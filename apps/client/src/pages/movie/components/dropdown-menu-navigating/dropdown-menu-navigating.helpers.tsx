import { Button } from "@/components/ui/button";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft } from "lucide-react";

export const DropdownMenuNavigatingHeader: React.FC<{
  title: string;
  goBack?: () => void;
}> = ({ title, goBack }) => {
  return (
    <DropdownMenuLabel className="flex items-center gap-2">
      {goBack && (
        <Button
          className="rounded-full"
          variant="ghost"
          size="icon"
          onClick={goBack}
        >
          <ChevronLeft />
        </Button>
      )}
      {title}
    </DropdownMenuLabel>
  );
};

export const DropdownMenuNavigatingPage: React.FC<{
  title: string;
  goBack?: () => void;
  children: React.ReactNode;
}> = ({ title, goBack, children }) => {
  return (
    <>
      <DropdownMenuNavigatingHeader title={title} goBack={goBack} />
      <DropdownMenuSeparator />
      <ScrollArea className="flex max-h-60 flex-col overflow-y-auto">
        <DropdownMenuGroup>{children}</DropdownMenuGroup>
      </ScrollArea>
    </>
  );
};

export const DropdownMenuSelectedItem: React.FC<{
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ selected, onClick, icon, children }) => {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2 w-[200px] truncate">
        <Check className={cn(!selected && "invisible")} />
        {children}
      </div>
      {icon}
    </DropdownMenuItem>
  );
};
