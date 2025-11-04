import { openDialog } from "@/components/dialogs/dialog.store";
import { ImageContainer } from "@/components/images/ImageContainer";
import { LoadingPage } from "@/components/LoadingPage";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getMoviesSchemas, getUrl } from "@hypertube/libs";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchCard } from "./components/SearchCard";

const initialPageParam = 1;

export const Library = () => {
  const { t } = useTranslation();
  const [maxPages, setMaxPages] = useState(1);
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const fetchMovies = async ({ pageParam = initialPageParam }) => {
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
    queryKey: ["movies"],
    queryFn: fetchMovies,
    initialPageParam,
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

  useEffect(() => {
    queryClient.resetQueries({ queryKey: ["movies"] });
  }, [query, queryClient]);

  if (isPending) return <LoadingPage resource="global"></LoadingPage>;
  if (isError) return <Typography>Error</Typography>;

  return (
    <Layout>
      <LayoutContent>
        <SearchCard setQuery={setQuery} />
        <Card className="p-5">
          {data.pages.map((group, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {group.movies.map((movie) => (
                <Card
                  key={movie.id}
                  className="flex p-1 md:p-5 items-center"
                  onClick={() => openDialog("movie", movie)}
                >
                  <ImageContainer
                    imageSrc={movie.poster_path}
                    altImage={movie.title}
                    size="md"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Typography variant="large" className="line-clamp-1">
                      {movie.title}
                    </Typography>
                    <Typography variant="muted">
                      {movie.genres.length
                        ? movie.genres.map(({ name }) => name).join(" / ")
                        : t("movie.page.missing.noGenres")}
                    </Typography>
                  </div>
                </Card>
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
        </Card>
        <div ref={bottomRef} />
      </LayoutContent>
    </Layout>
  );
};
