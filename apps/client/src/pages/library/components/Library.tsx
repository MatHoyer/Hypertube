import { InfiniteVirtualizer } from "@/components/InfiniteVirtualizer";
import { useMainScrollElement } from "@/layouts/BaseLayout";
import { WINDOW_MIN_WIDTH } from "@/lib/const";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getMoviesSchemas,
  getUrl,
  ROUTES,
  type TTmdbCategory,
  type TTmdbGenresKey,
  type TTmdbSort,
} from "@hypertube/libs";
import { LibraryEmpty } from "./LibraryEmpty";
import { useLibrary } from "./LibraryProvider";
import { Thumbnail } from "./Thumbnail";

const fetchMovies = async ({
  pageParam,
  query,
  category,
  sort,
  genres,
}: {
  pageParam: number;
  query: string;
  category: TTmdbCategory | null;
  sort: TTmdbSort | null;
  genres: TTmdbGenresKey[];
}) => {
  const res = await axiosFetch({
    method: "GET",
    schemas: getMoviesSchemas,
    url: getUrl(ROUTES.API.MOVIES, {
      searchParams: {
        page: pageParam,
        query,
        category,
        sort,
        genres: genres && genres.join(","),
      },
    }),
  });
  return { data: res.movies, ...res };
};

export const Library = () => {
  const mainScrollElement = useMainScrollElement();
  const { query, category, sort, genres } = useLibrary();

  const queryFn = ({ pageParam }: { pageParam: number }) =>
    fetchMovies({
      pageParam,
      query,
      category,
      sort,
      genres,
    });

  const queryKey = getQueryKey(ROUTES.API.MOVIES, {
    searchParams: {
      query,
      category,
      sort,
      genres,
    },
  });

  const virtualizerOptions = {
    getScrollElement: () => mainScrollElement,
    estimateSize: () => 385,
    gap: 8,
    overscan: 5,
  };

  const getColumns = () => {
    if (window.innerWidth >= WINDOW_MIN_WIDTH.LG) return 5;
    else if (window.innerWidth >= WINDOW_MIN_WIDTH.MD) return 4;
    return 2;
  };

  return (
    <InfiniteVirtualizer
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full top-0 left-0"
      queryFn={queryFn}
      queryKey={queryKey}
      enabled={!!query || !!category || !!sort || !!genres}
      getColumns={getColumns}
      virtualizerOptions={virtualizerOptions}
      renderChild={(movie) => <Thumbnail movie={movie} />}
      emptyChild={<LibraryEmpty />}
      resourceTypes="movies"
    />
  );
};
