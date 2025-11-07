import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  getMoviesSchemas,
  getUrl,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const SearchCard: React.FC<{
  setQuery: (value: string) => void;
}> = ({ setQuery }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState<TTmdbMovieSchema[]>([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (input) {
        const res = await axiosFetch({
          method: "GET",
          schemas: getMoviesSchemas,
          url: getUrl("api-movies", {
            searchParams: { page: "1", name: input },
          }),
        });
        setMovies(res.movies);
      } else setMovies([]);
    }, 500);
    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <Command filter={(_, __) => 1}>
      <CommandInput
        placeholder={t("navbar.placeholder")}
        onKeyDown={({ code }) => {
          if (code === "Enter") setQuery(input);
        }}
        onValueChange={(value) => setInput(value)}
      />
      <ScrollArea>
        <CommandList className="overflow-visible">
          {!!movies.length && (
            <CommandGroup>
              {movies.map((movie, i) => (
                <CommandItem key={i} value={movie.title + movie.id}>
                  <MovieBaseInfo
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_4fr_1fr_1fr] items-center w-full gap-2"
                    movie={movie}
                    posterSize="sm"
                    info="partial"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};
