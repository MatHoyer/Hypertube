import { useEffect } from "react";
import { ActivePill } from "./animated/ActivePill";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "./ui/pagination";

export const PagePagination: React.FC<{
  page: number;
  setPage: (value: number | ((old: number) => number | null)) => void;
  pageSize: number;
  totalCount: number;
}> = ({ page, setPage, pageSize, totalCount }) => {
  const lastPage = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (page > lastPage) setPage(1);
  }, [page, lastPage, setPage]);

  if (lastPage <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        {page > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
          </PaginationItem>
        )}
        {page > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {page > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => setPage((prev) => prev - 1)}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem className="relative">
          <ActivePill layoutId="pagination" />
          <PaginationLink className="opacity-50 pointer-events-none">
            {page}
          </PaginationLink>
        </PaginationItem>
        {page < lastPage && (
          <PaginationItem>
            <PaginationLink onClick={() => setPage((prev) => prev + 1)}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {page < lastPage - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {page < lastPage - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => setPage(lastPage)}>
              {lastPage}
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
