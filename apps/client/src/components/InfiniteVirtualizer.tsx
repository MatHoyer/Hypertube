import type { TResourceType } from "@/lib/const";
import { cn } from "@/lib/utils";
import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import {
  useVirtualizer,
  type PartialKeys,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { ErrorResource } from "./ErrorResource";
import { LoadingResource } from "./LoadingResource";
import { AppLoader } from "./ui/app-loader";

type TInfiniteVirtualizerFetchResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type TVirtualizerOptions = PartialKeys<
  VirtualizerOptions<HTMLElement, Element>,
  "observeElementRect" | "observeElementOffset" | "scrollToFn" | "count"
>;

type TInfiniteVirtualizerProps<T> = {
  className: string;
  queryFn: ({
    pageParam,
  }: {
    pageParam: number;
  }) => Promise<TInfiniteVirtualizerFetchResponse<T>>;
  queryKey: QueryKey;
  initialPageParam?: number;
  enabled?: boolean;
  getColumns?: () => number;
  virtualizerOptions: TVirtualizerOptions;
  renderChild: (
    data: TInfiniteVirtualizerFetchResponse<T>["data"][number]
  ) => React.ReactNode;
  emptyChild: JSX.Element;
  resourceTypes?: TResourceType;
};

export const InfiniteVirtualizer = <T,>({
  className,
  queryFn,
  queryKey,
  initialPageParam = 1,
  enabled = true,
  getColumns,
  virtualizerOptions,
  renderChild,
  emptyChild,
  resourceTypes = "global",
}: TInfiniteVirtualizerProps<T>) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(getColumns ? 5 : 1);

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

  const allData = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data) : []),
    [data]
  );
  const totalRows = Math.ceil(allData.length / columns);

  const virtualizer = useVirtualizer({
    count: totalRows,
    ...virtualizerOptions,
  });

  useEffect(() => {
    if (!getColumns) return;

    const updateColumns = () => {
      setColumns(getColumns());
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);

    return () => window.removeEventListener("resize", updateColumns);
  }, [getColumns]);

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

  if (isPending) return <LoadingResource resource={resourceTypes} />;
  if (isError) return <ErrorResource resource={resourceTypes} />;

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
                  {renderChild(item)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex w-full justify-center">
        {isFetchingNextPage && <AppLoader />}
        {!data.pages[0].total && emptyChild}
      </div>
    </>
  );
};
