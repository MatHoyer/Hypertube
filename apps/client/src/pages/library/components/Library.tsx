import { LoadingPage } from "@/components/LoadingPage";
import { AppLoader } from "@/components/ui/app-loader";
import { Typography } from "@/components/ui/typography";
import useDebounce from "@/hooks/use-debounce";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getMoviesSchemas, getUrl } from "@hypertube/libs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { parseAsTmdbGenres, useLibrary } from "./LibraryProvider";
import { Thumbnail } from "./Thumbnail";

export const Library = () => {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { query, sortBy, filters } = useLibrary();

  const fetchMovies = async ({ pageParam }: { pageParam: number }) => {
    const res = await axiosFetch({
      method: "GET",
      schemas: getMoviesSchemas,
      url: getUrl("api-movies", {
        searchParams: {
          page: pageParam.toString(),
          name: query,
          sortBy,
          filters: parseAsTmdbGenres.serialize(filters),
        },
      }),
    });
    return res;
  };

  const queryDebounced = useDebounce(query, 500);
  const filtersDebounced = useDebounce(filters, 500);
  const sortByDebounced = useDebounce(sortBy, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: ["movies", queryDebounced, sortByDebounced, filtersDebounced],
    queryFn: fetchMovies,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.totalPages > lastPage.page ? lastPage.page + 1 : undefined,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    const currentRef = bottomRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => observer.disconnect();
  }, [bottomRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <LoadingPage resource="global"></LoadingPage>;
  if (isError) {
    return (
      <div className="flex justify-center items-center">
        <Typography variant="large">{t("global.error")}</Typography>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.pages.map((group, i) => (
          <div
            key={i}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2"
          >
            {group.movies.map((movie, i) => (
              <Thumbnail key={i} movie={movie} />
            ))}
          </div>
        ))}
        <div className="flex w-full justify-center">
          {isFetchingNextPage && <AppLoader />}
          {!data.pages[0].totalResults && (
            <Typography variant="large">{t("movie.page.noFound")}</Typography>
          )}
        </div>
      </div>
      <div ref={bottomRef} />
    </>
  );
};
