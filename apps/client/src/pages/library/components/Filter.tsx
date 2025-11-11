import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";
import { tmdbDefaultSortBy, tmdbGenres, tmdbSortBy } from "@hypertube/libs";
import { Circle } from "lucide-react";

export const Filter: React.FC<{
  setQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  filters: string[];
  setFilters: (value: string[] | ((old: string[]) => string[])) => void;
}> = ({ setQuery, sortBy, setSortBy, filters, setFilters }) => {
  return (
    <div className="flex justify-between p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button>{"Sort By"}</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <ScrollArea className="h-full">
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="flex flex-col gap-5 p-5">
              <Typography variant="h2">{"SortBy"}</Typography>
              <Separator />
              <RadioGroup defaultValue={sortBy || tmdbDefaultSortBy}>
                {tmdbSortBy.map((sort) => (
                  <div key={sort} className="flex gap-2">
                    <RadioGroupItem
                      value={sort}
                      onClick={() => setSortBy(sort)}
                    />
                    <Label>{sort}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Typography variant="h2">{"Genres"}</Typography>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {Object.entries(tmdbGenres).map(([name, id]) => (
                  <Toggle
                    key={id}
                    variant={"outline"}
                    className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-primary data-[state=on]:*:[svg]:stroke-primary"
                    defaultPressed={filters.includes(name)}
                    onClick={() => {
                      setFilters((prev) => {
                        if (prev.includes(name)) {
                          return prev.filter((g) => g !== name);
                        }
                        return [...prev, name];
                      });
                    }}
                  >
                    <Circle />
                    {name}
                  </Toggle>
                ))}
              </div>
            </div>
            <Separator />
            <SheetFooter>
              <SheetClose asChild>
                <Button>Close</Button>
              </SheetClose>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Button
        onClick={() => {
          setQuery("");
          setSortBy("");
          setFilters([]);
        }}
      >
        {"Reset filter"}
      </Button>
    </div>
  );
};
