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
import { useTranslation } from "react-i18next";
import { useLibrary } from "./LibraryProvider";

export const Filter = () => {
  const { t } = useTranslation();
  const { setQuery, sortBy, setSortBy, filters, setFilters } = useLibrary();

  return (
    <div className="flex justify-between p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button>{t("movie.filter.title")}</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <ScrollArea className="h-full">
            <SheetHeader>
              <SheetTitle>{t("movie.filter.title")}</SheetTitle>
              <SheetDescription>{t("movie.filter.desc")}</SheetDescription>
              <SheetDescription>{t("movie.filter.descNote")}</SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="flex flex-col gap-5 p-5">
              <Typography variant="h2">
                {t("movie.filter.sort.title")}
              </Typography>
              <Separator />
              <RadioGroup defaultValue={sortBy || tmdbDefaultSortBy}>
                {tmdbSortBy.map((sort) => (
                  <div key={sort} className="flex gap-2">
                    <RadioGroupItem
                      value={sort}
                      onClick={() => setSortBy(sort)}
                    />
                    <Label>
                      {t(
                        `movie.filter.sort.${
                          sort as (typeof tmdbSortBy)[number]
                        }`
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Typography variant="h2">
                {t("movie.filter.genres.title")}
              </Typography>
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
                    {t(
                      `movie.filter.genres.${name as keyof typeof tmdbGenres}`
                    )}
                  </Toggle>
                ))}
              </div>
            </div>
            <Separator />
            <SheetFooter>
              <SheetClose asChild>
                <Button>{t("global.close")}</Button>
              </SheetClose>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Button
        onClick={() => {
          setQuery("");
          setSortBy(tmdbDefaultSortBy);
          setFilters([]);
        }}
      >
        {t("movie.filter.reset")}
      </Button>
    </div>
  );
};
