import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import notfoundImg from "/animation/not-found.png";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  onApprove?: (data: TData) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  currentUser?: any;
}

export const getCommonPinningStyles = <T,>(
  column: Column<T>,
): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-2px 0 2px -2px gray inset"
      : isFirstRightPinnedColumn
        ? "2px 0 2px -2px gray inset"
        : undefined,
    borderTopRightRadius: "calc(var(--radius) /* 0.25rem = 4px */ - 2px)",
    borderBottomRightRadius: "calc(var(--radius) /* 0.25rem = 4px */ - 2px)",
    right: isPinned === "right" ? `${column.getStart("right")}px` : undefined,
    backgroundColor: isPinned ? "white" : "transparent",
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 49 : 0,
  };
};

export function DataTable<TData, TValue>({
  columns,
  data,
  onEdit = () => {},
  onDelete = () => {},
  onApprove = () => {},
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  isLoading = false,
  currentUser,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((user: any) => {
      const email = user.email?.toLowerCase() || "";
      const fullName = user.full_name?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      return email.includes(term) || fullName.includes(term);
    });
  }, [data, searchTerm]);

  const totalTableWidth = useMemo(() => {
    return columns.reduce((total, column) => {
      const columnWidth = (column as any).size || 10;
      return total + columnWidth;
    }, 0);
  }, [columns]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    initialState: {
      columnPinning: {
        right: ["actions"],
      },
    },
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      onEdit,
      onDelete,
      onApprove,
      currentUser,
    },
  });

  return (
    <div>
      <div className="relative mx-1 flex items-center py-4">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by email or full name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="md:text-md w-full pr-10 pl-10 text-sm"
        />
      </div>

      <div className="relative w-full rounded-md border">
        <div className="w-full overflow-x-auto">
          <Table
            style={{ minWidth: `${totalTableWidth}px` }}
            className="w-full"
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const { column } = header;

                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles(column),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}

                        <div
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `resizer ${
                              header.column.getIsResizing() ? "isResizing" : ""
                            }`,
                          }}
                        />
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const { column } = cell;
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles(column),
                            whiteSpace: "nowrap",
                            maxWidth: column.getSize(),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 py-8 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={notfoundImg}
                        alt="No results found"
                        className="mb-6 w-24"
                      />
                      <p className="text-muted-foreground">No results found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage >= totalPages || totalPages === 0}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
