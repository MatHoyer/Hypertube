import { cn } from "@/lib/utils";
import type { TGetMoviesSchemas } from "@hypertube/libs";
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useTranslation } from "react-i18next";
import { LoadingResource } from "./LoadingResource";
import { AppLoader } from "./ui/app-loader";
import { Typography } from "./ui/typography";

export const InfiniteVirtualizer: React.FC<
  Omit<ComponentProps<"div">, "children"> & {
    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<TGetMoviesSchemas["response"]>;
    queryKey: QueryKey;
    initialPageParam?: number;
    enabled?: boolean;
    withColumns?: boolean;
    virtualizerOptions: {
      getScrollElement: () => HTMLElement | null;
      estimateSize: () => number;
      gap: number;
      overscan: number;
    };
    children: (
      data: TGetMoviesSchemas["response"]["movies"][number]
    ) => React.ReactNode;
  }
> = ({
  queryFn,
  queryKey,
  initialPageParam = 1,
  enabled = true,
  withColumns = false,
  virtualizerOptions,
  className,
  children,
}) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(withColumns ? 5 : 1);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam,
    getNextPageParam: (lastPage) =>
      lastPage.totalPages > lastPage.page ? lastPage.page + 1 : undefined,
    enabled,
  });

  const allData = data ? data.pages.flatMap((page) => page.movies) : [];
  const totalRows = Math.ceil(allData.length / columns);

  const virtualizer = useVirtualizer({
    count: totalRows,
    ...virtualizerOptions,
  });

  const updateColumns = useCallback(() => {
    if (withColumns) {
      if (window.innerWidth >= 1024) setColumns(5);
      else if (window.innerWidth >= 768) setColumns(4);
      else if (window.innerWidth >= 640) setColumns(2);
      else setColumns(2);
    }
  }, [withColumns]);

  useEffect(() => {
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [updateColumns]);

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
            className={cn(className, "absolute")}
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {Array.from({ length: columns }, (_, colIndex) => {
              const itemIndex = virtualRow.index * columns + colIndex;
              const item = allData[itemIndex];

              if (itemIndex >= data.pages[0].total) {
                return <div key={`${virtualRow.index}-${colIndex}`} />;
              }
              return (
                <div key={`${virtualRow.index}-${colIndex}`}>
                  {children(item)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex w-full justify-center">
        {isFetchingNextPage && <AppLoader />}
        {!data.pages[0].total && (
          <Typography textSize="lg">{t("movie.page.noFound")}</Typography> // todo
        )}
      </div>
    </>
  );
};
