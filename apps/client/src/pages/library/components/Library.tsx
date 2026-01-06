import { InfiniteVirtualizer } from "@/components/InfiniteVirtualizer";
import { useMainScrollElement } from "@/layouts/BaseLayout";
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
        page: pageParam.toString(),
        query,
        category,
        sort,
        genres: genres && genres.join(","),
      },
    }),
  });
  return res;
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
    estimateSize: () => 373,
    gap: 8,
    overscan: 5,
  };

  return (
    <InfiniteVirtualizer
      queryFn={queryFn}
      queryKey={queryKey}
      enabled={!!query || !!category || !!sort || !!genres}
      withColumns
      virtualizerOptions={virtualizerOptions}
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full top-0 left-0"
    >
      {(movie) => <Thumbnail movie={movie} />}
    </InfiniteVirtualizer>
  );
};
