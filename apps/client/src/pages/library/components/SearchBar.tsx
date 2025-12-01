import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { AppLoader } from "@/components/ui/app-loader";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import useDebounce from "@/hooks/use-debounce";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import { getMoviesSchemas, getUrl, ROUTES } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLibrary } from "./LibraryProvider";

export const SearchBar = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>("");
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { query, setQuery } = useLibrary();
  const inputDebounced = useDebounce(input, 200);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isPending, isSuccess } = useQuery({
    queryKey: [
      getQueryKey(ROUTES.API.MOVIES, {
        searchParams: { input: inputDebounced },
      }),
    ],
    queryFn: () =>
      axiosFetch({
        method: "GET",
        schemas: getMoviesSchemas,
        url: getUrl(ROUTES.API.MOVIES, {
          searchParams: { page: "1", query: inputDebounced ?? "" },
        }),
      }),
    enabled: !!inputDebounced,
  });

  return (
    <div className="relative">
      <Command
        ref={searchBarRef}
        className={cn(isOpen && inputDebounced && "rounded-b-none")}
        filter={() => 1}
      >
        <CommandInput
          ref={inputRef}
          placeholder={t("navbar.placeholder")}
          onKeyDown={({ code, currentTarget }) => {
            if (code === "Enter") {
              setQuery(input ?? currentTarget.value);
              setInput("");
              inputRef.current?.blur();
            }
          }}
          onValueChange={(value) => {
            setInput(value);
            setIsOpen(true);
          }}
          value={input === null ? query : input}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
        <div
          className={cn(
            "absolute h-full inset-0 z-50",
            !(isOpen && inputDebounced) && "hidden"
          )}
          style={{
            top: searchBarRef.current?.getBoundingClientRect()?.height,
          }}
        >
          <ScrollArea scrollToTopOnChildrenChange>
            <CommandList className="overflow-visible">
              <CommandGroup className="bg-card">
                {!!data?.movies.length &&
                  !isPending &&
                  isSuccess &&
                  data?.movies.filter(Boolean).map((movie, i) => (
                    <CommandItem
                      key={i}
                      value={movie!.title + movie!.id}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      <Link
                        className="w-full"
                        to={getUrl(ROUTES.CLIENT.MOVIE, { tmdbId: movie!.id })}
                      >
                        <MovieBaseInfo
                          movie={movie!}
                          dir="col"
                          posterSize="sm"
                          info="partial"
                        />
                      </Link>
                    </CommandItem>
                  ))}
                {!isPending && isSuccess && !data?.totalResults && (
                  <CommandItem
                    className="flex justify-center"
                    value="no_result"
                    disabled
                  >
                    <Typography>{t("movie.page.noFound")}</Typography>
                  </CommandItem>
                )}
                {isPending && (
                  <CommandItem
                    className="flex justify-center"
                    value="loading"
                    disabled
                  >
                    <AppLoader />
                  </CommandItem>
                )}
                {!isPending && !isSuccess && (
                  <CommandItem
                    className="flex justify-center"
                    value="error"
                    disabled
                  >
                    <Typography>{t("global.error")}</Typography>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </div>
      </Command>
    </div>
  );
};
