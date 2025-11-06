import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import {
  getMoviesSchemas,
  getUrl,
  type TTmdbMovieSchema,
} from "@hypertube/libs";
import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const SearchCard: React.FC<{
  setQuery: (value: string) => void;
}> = ({ setQuery }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState<TTmdbMovieSchema[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOnFocus, setIsOnFocus] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardCoords, setCardCoords] = useState<DOMRect>(new DOMRect());

  useEffect(() => {
    if (!cardRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (cardRef.current) {
        setCardCoords(cardRef.current.getBoundingClientRect());
        console.log(cardRef.current.getBoundingClientRect());
      }
    });
    resizeObserver.observe(cardRef.current);

    return () => resizeObserver.disconnect();
  }, []);

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
        setIsSearching(true);
        setMovies(res.movies);
      } else {
        setIsSearching(false);
        setMovies([]);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <>
      <Card
        className={cn("m-5 p-5", isSearching && isOnFocus && "rounded-b-none")}
        ref={cardRef}
      >
        <InputGroup>
          <InputGroupInput
            placeholder={t("navbar.placeholder")}
            onFocus={() => setIsOnFocus(true)}
            onBlur={() => setIsOnFocus(false)}
            onKeyDown={({ code }) => {
              if (code === "Enter") setQuery(input);
            }}
            onChange={({ currentTarget }) => setInput(currentTarget.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Badge>test</Badge>
      </Card>
      {isSearching && isOnFocus && (
        <Card
          className="absolute z-50 rounded-t-none p-0"
          style={{
            left: cardCoords.x,
            top: cardCoords.y + cardCoords.height - 65 - 1,
            width: cardCoords.width,
          }}
        >
          <ScrollArea className="h-96">
            {movies.map((movie, i) => (
              <Card key={i}>{movie.title}</Card>
            ))}
          </ScrollArea>
        </Card>
      )}
    </>
  );
};
