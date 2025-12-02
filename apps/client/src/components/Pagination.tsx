import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export const PagePagination: React.FC<{
  page: number;
  setPage: (value: number | ((old: number) => number | null)) => void;
  totalCount: number;
}> = ({ page, setPage, totalCount }) => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={cn(page <= 1 && "opacity-50 pointer-events-none")}
            onClick={() => setPage((prev) => prev - 1)}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            className={cn(
              totalCount <= page * 10 && "opacity-50 pointer-events-none"
            )}
            onClick={() => setPage((prev) => prev + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
