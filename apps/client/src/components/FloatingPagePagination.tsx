import { useEffect } from "react";
import { ActivePill } from "./animated/ActivePill";
import { FloatingBar } from "./ui/FloatingBar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "./ui/pagination";

export const FloatingPagePagination: React.FC<{
  page: number;
  setPage: (value: number | ((old: number) => number)) => void;
  maxPage: number;
}> = ({ page, setPage, maxPage }) => {
  useEffect(() => {
    if (page > maxPage) setPage(1);
  }, [page, maxPage, setPage]);

  if (maxPage <= 1) return null;

  return (
    <FloatingBar>
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
          {page < maxPage && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage((prev) => prev + 1)}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          {page < maxPage - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page < maxPage - 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => setPage(maxPage)}>
                {maxPage}
              </PaginationLink>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </FloatingBar>
  );
};
