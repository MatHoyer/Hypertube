import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export const PagePagination: React.FC<{
  page: number;
  setPage: (value: number | ((old: number) => number | null)) => void;
  pageSize: number;
  totalCount: number;
}> = ({ page, setPage, pageSize, totalCount }) => {
  const lastPage = Math.ceil(totalCount / pageSize);

  if (lastPage <= 1) return <div></div>;

  return (
    <Pagination>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious onClick={() => setPage((prev) => prev - 1)} />
          </PaginationItem>
        )}
        {page > 2 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        {page > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => setPage((prev) => prev - 1)}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
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
        {page < lastPage - 1 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={() => setPage(lastPage)}>
                {lastPage}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        {page < lastPage && (
          <PaginationItem>
            <PaginationNext onClick={() => setPage((prev) => prev + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
