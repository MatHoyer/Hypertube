import { LoadingResource } from "@/components/LoadingResource";
import { AppLoader } from "@/components/ui/app-loader";
import { Typography } from "@/components/ui/typography";
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
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const mainScrollElement = useMainScrollElement();
  const [columns, setColumns] = useState(5);
  const { query, category, sort, genres } = useLibrary();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES, {
      searchParams: {
        query,
        category,
        sort,
        genres,
      },
    }),
    queryFn: ({ pageParam }) =>
      fetchMovies({
        pageParam,
        query,
        category,
        sort,
        genres,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.totalPages > lastPage.page ? lastPage.page + 1 : undefined,
    enabled: !!query || !!category || !!sort || !!genres,
  });

  const allMovies = data ? data.pages.flatMap((page) => page.movies) : [];
  const totalRows = Math.ceil(allMovies.length / columns);

  const virtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => mainScrollElement,
    estimateSize: () => 373,
    gap: 8,
    overscan: 5,
  });

  const updateColumns = () => {
    if (window.innerWidth >= 1024) setColumns(5);
    else if (window.innerWidth >= 768) setColumns(4);
    else if (window.innerWidth >= 640) setColumns(2);
    else setColumns(2);
  };

  useEffect(() => {
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (lastItem.index >= totalRows - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    totalRows,
    isFetchingNextPage,
    virtualizer,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    virtualizer.getVirtualItems(),
  ]);

  if (isPending) return <LoadingResource resource="global" />;
  if (isError) {
    return (
      <div className="flex justify-center items-center">
        <Typography textSize="lg">{t("global.error")}</Typography>
      </div>
    );
  }

  return (
    <>
      <div
        ref={listRef}
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full top-0 left-0"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {Array.from({ length: columns }, (_, colIndex) => {
              const itemIndex = virtualRow.index * columns + colIndex;
              const movie = allMovies[itemIndex];

              if (itemIndex >= data.pages[0].total) {
                return <div key={`${virtualRow.index}-${colIndex}`}></div>;
              }

              return (
                <Thumbnail
                  key={`${virtualRow.index}-${colIndex}`}
                  movie={movie}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex w-full justify-center">
        {isFetchingNextPage && <AppLoader />}
        {!data.pages[0].total && (
          <Typography textSize="lg">{t("movie.page.noFound")}</Typography>
        )}
      </div>
    </>
  );
};
