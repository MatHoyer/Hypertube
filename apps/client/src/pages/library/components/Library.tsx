import { LoadingPage } from "@/components/LoadingPage";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getMoviesSchemas, getUrl } from "@hypertube/libs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Thumbnail } from "./Thumbnail";

export const Library: React.FC<{ query: string }> = ({ query }) => {
  const { t } = useTranslation();
  const [maxPages, setMaxPages] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMovies = async (pageParam: number) => {
    const res = await axiosFetch({
      method: "GET",
      schemas: getMoviesSchemas,
      url: getUrl("api-movies", {
        searchParams: { page: pageParam.toString(), name: query },
      }),
    });
    setMaxPages(res.totalPages);
    return res;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: ["movies", query],
    queryFn: ({ pageParam }) => fetchMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      maxPages > lastPage.page ? lastPage.page + 1 : null,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    const currentRef = bottomRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.disconnect();
    };
  }, [bottomRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <LoadingPage resource="global"></LoadingPage>;
  if (isError) return <Typography>Error</Typography>;

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.pages.map((group, i) => (
          <div
            key={i}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2"
          >
            {group.movies.map((movie) => (
              <Thumbnail key={movie.id} movie={movie} />
            ))}
          </div>
        ))}
        {!hasNextPage && (
          <div className="flex justify-center">
            <Typography variant="large">
              {data.pages[0].totalResults
                ? t("movie.page.noMore")
                : t("movie.page.noFound")}
            </Typography>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </>
  );
};
