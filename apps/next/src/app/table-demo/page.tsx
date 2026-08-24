"use client";

import * as React from "react";
import { useStore } from "@tanstack/react-form";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAppForm } from "@/components/forms/form-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { paymentColumns, paymentData } from "@/app/table-demo/payments-columns";

export default function TableDemoPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: paymentData,
    columns: paymentColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection }
  });
  const filterForm = useAppForm({
    defaultValues: { email: "" },
    onSubmit: async () => undefined
  });
  const emailFilter = useStore(filterForm.store, (state) => state.values.email);
  React.useEffect(() => {
    table.getColumn("email")?.setFilterValue(emailFilter);
  }, [emailFilter, table]);

  return (
    <div className="w-full p-4">
      <div className="flex items-center py-4">
        <filterForm.AppForm>
          <filterForm.AppField name="email">
            {(field) => (
              <field.FormInput
                data-testid="next-table-filter"
                placeholder="Filter emails..."
                labelProps={{
                  className: "sr-only",
                  children: "Filter emails",
                  "data-testid": "next-table-filter-label"
                }}
                className="max-w-sm"
              />
            )}
          </filterForm.AppField>
        </filterForm.AppForm>
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="next-table-columns-trigger">
            <Button
              data-testid="next-table-columns-button"
              variant="outline"
              className="ml-auto"
            >
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="next-table-columns-content"
            align="end"
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  data-testid={`next-table-column-${column.id}`}
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table data-testid="next-payments-table">
          <TableHeader data-testid="next-payments-table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                data-testid={`next-payments-header-row-${headerGroup.id}`}
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    data-testid={`next-payments-head-${header.id}`}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody data-testid="next-payments-table-body">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-testid={`next-payments-row-${row.id}`}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      data-testid={`next-payments-cell-${cell.id}`}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow data-testid="next-payments-empty-row">
                <TableCell
                  data-testid="next-payments-empty-cell"
                  colSpan={paymentColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            data-testid="next-table-previous"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            data-testid="next-table-next"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
