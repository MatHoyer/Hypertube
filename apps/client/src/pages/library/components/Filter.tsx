import { Button } from "@/components/ui/button";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import {
  tmdbCategories,
  tmdbGenres,
  tmdbSorts,
  typedEntries,
  type TTmdbCategory,
  type TTmdbGenresKey,
  type TTmdbSort,
} from "@hypertube/libs";
import { Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLibrary } from "./LibraryProvider";

const CategoriesFilter = () => {
  const { t } = useTranslation();
  const { category: categoryState, setCategory } = useLibrary();

  return (
    <>
      <Typography variant="h2">{t("movie.filter.category.title")}</Typography>
      <Separator />
      <div className="flex justify-center">
        <ToggleGroup
          type="single"
          spacing={2}
          variant={"icon"}
          className="grid grid-cols-1 sm:grid-cols-2 w-full"
          value={categoryState ?? "none"}
          onValueChange={(value: TTmdbCategory) => {
            setCategory(value);
          }}
        >
          {tmdbCategories.map((category) => (
            <ToggleGroupItem
              key={category}
              value={category}
              disabled={category === categoryState}
            >
              <Circle />
              {t(`movie.filter.category.${category}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
};

const SortsFilter = () => {
  const { t } = useTranslation();
  const { sort: sortState, setSort } = useLibrary();

  return (
    <>
      <Typography variant="h2">{t("movie.filter.sort.title")}</Typography>
      <Separator />
      <div className="flex justify-center">
        <ToggleGroup
          type="single"
          spacing={2}
          variant={"icon"}
          className="grid grid-cols-1 sm:grid-cols-2 w-full"
          value={sortState ? sortState : "none"}
          onValueChange={(value: TTmdbSort) => setSort(value)}
        >
          {tmdbSorts.map((sort) => (
            <ToggleGroupItem
              key={sort}
              value={sort}
              disabled={sort === sortState}
            >
              <Circle />
              {t(`movie.filter.sort.${sort}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
};

const GenresFilter = () => {
  const { t } = useTranslation();
  const { genres, setGenres } = useLibrary();

  return (
    <>
      <Typography variant="h2">{t("movie.filter.genres.title")}</Typography>
      <Separator />
      <div className="flex justify-center">
        <ToggleGroup
          type="multiple"
          spacing={2}
          variant={"icon"}
          className="grid grid-cols-1 sm:grid-cols-2 w-full"
          value={genres}
          onValueChange={(value: TTmdbGenresKey[]) => setGenres(value)}
        >
          {typedEntries(tmdbGenres).map(([name, id]) => (
            <ToggleGroupItem key={id} value={name}>
              <Circle />
              {t(`movie.filter.genres.${name}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
};

export const Filter = () => {
  const { t } = useTranslation();
  const { reset } = useLibrary();

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
              <CategoriesFilter />
              <SortsFilter />
              <GenresFilter />
            </div>
            <Separator />
            <SheetFooter>
              <Button onClick={reset}>{t("movie.filter.reset")}</Button>
              <SheetClose asChild>
                <Button>{t("global.close")}</Button>
              </SheetClose>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};
