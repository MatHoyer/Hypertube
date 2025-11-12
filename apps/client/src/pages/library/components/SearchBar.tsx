import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import useDebounce from "@/hooks/use-debounce";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import { getMoviesSchemas, getUrl } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LibraryContext } from "../library.page";

export const SearchBar = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { setQuery } = useContext(LibraryContext);
  const inputDebounced = useDebounce(input, 200);

  const { data } = useQuery({
    queryKey: ["searchMovies", inputDebounced],
    queryFn: async () =>
      await axiosFetch({
        method: "GET",
        schemas: getMoviesSchemas,
        url: getUrl("api-movies", {
          searchParams: { page: "1", name: inputDebounced ?? "" },
        }),
      }),
  });

  return (
    <div className="relative">
      <Command
        ref={searchBarRef}
        className={cn(data?.movies.length && "rounded-b-none")}
        filter={() => 1}
      >
        <CommandInput
          placeholder={t("navbar.placeholder")}
          onKeyDown={({ code }) => {
            if (code === "Enter") {
              setQuery(input);
              setInput("");
            }
          }}
          onValueChange={(value) => setInput(value)}
          value={input}
        />
        <div
          className="absolute inset-0 z-50"
          style={{
            top: searchBarRef.current?.getBoundingClientRect()?.height,
          }}
        >
          <ScrollArea>
            <CommandList className="overflow-visible">
              {!!data?.movies.length && (
                <CommandGroup className="bg-card">
                  {data?.movies.filter(Boolean).map((movie, i) => (
                    <CommandItem key={i} value={movie!.title + movie!.id}>
                      <Link
                        className="w-full"
                        to={getUrl("client-movie", { tmdbId: movie!.id })}
                      >
                        <MovieBaseInfo
                          className="flex flex-col sm:grid sm:grid-cols-[1fr_4fr_1fr_1fr] items-center w-full gap-2"
                          movie={movie!}
                          posterSize="sm"
                          info="partial"
                        />
                      </Link>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </ScrollArea>
        </div>
      </Command>
    </div>
  );
};
