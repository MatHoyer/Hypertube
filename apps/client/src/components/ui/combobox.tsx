import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Add more placeholder types here
type TPlaceholder = "language";

interface ComboboxProps {
  elements: { value: string; label: string }[];
  value: string;
  setValue: (value: string) => void;
  placeholderType: TPlaceholder;
  modal?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  elements,
  value,
  setValue,
  placeholderType,
  modal = false,
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? elements.find((element) => element.value === value)?.label
            : t(`combobox.${placeholderType}.noElementFound`)}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={t(`combobox.${placeholderType}.search`)}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {t(`combobox.${placeholderType}.noElementFound`)}
            </CommandEmpty>
            <CommandGroup>
              {elements.map((element) => (
                <CommandItem
                  key={element.value}
                  value={element.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {element.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === element.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
