import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
    <Command>
      <CommandInput
        placeholder={t("navbar.placeholder")}
        onKeyDown={({ code }) => {
          if (code === "Enter") setQuery(input);
        }}
        onValueChange={(value) => setInput(value)}
      />
      <CommandList>
        {!!movies.length && (
          <CommandGroup>
            {movies.map((movie, i) => (
              <CommandItem key={i} value={movie.title + movie.id}>
                <div className="flex">
                  <MovieBaseInfo movie={movie} info="partial" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};
