import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStore } from "@tanstack/react-form";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState
} from "@tanstack/react-table";

import { Button, ButtonText } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppForm } from "@/components/forms/form-core";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { copyText } from "@/lib/clipboard";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TableDemo">;

type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@example.com"
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@example.com"
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@example.com"
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@example.com"
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com"
  }
];

const columns: ColumnDef<Payment>[] = [
  { id: "select", header: "", enableSorting: false, enableHiding: false },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "amount", header: "Amount" },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false
  }
];

export function TableDemoScreen(_props: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 2 } },
    state: { sorting, columnFilters, columnVisibility, rowSelection }
  });
  const filterForm = useAppForm({
    defaultValues: { email: "" },
    onSubmit: async () => undefined
  });
  const emailFilter = useStore(filterForm.store, (state) => state.values.email);
  useEffect(() => {
    table.getColumn("email")?.setFilterValue(emailFilter);
  }, [emailFilter, table]);
  const visibleColumns = table.getVisibleLeafColumns();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
    >
      <View className="gap-3">
        <filterForm.AppForm>
          <filterForm.AppField name="email">
            {(field) => (
              <field.FormInput
                placeholder="Filter emails..."
                labelProps={{ children: "Filter emails" }}
              />
            )}
          </filterForm.AppField>
        </filterForm.AppForm>
        <View className="flex-row flex-wrap gap-3">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <View key={column.id} className="flex-row items-center gap-2">
                <Switch
                  value={column.getIsVisible()}
                  onValueChange={(value) => column.toggleVisibility(value)}
                />
                <Text className="capitalize text-sm text-foreground">
                  {column.id}
                </Text>
              </View>
            ))}
        </View>
      </View>
      <ScrollView horizontal>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <View key={column.id} className="min-w-28 flex-1">
                  {column.id === "select" ? (
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      onCheckedChange={(checked) =>
                        table.toggleAllPageRowsSelected(checked)
                      }
                    />
                  ) : column.id === "email" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                      }
                    >
                      <ButtonText className="text-foreground">
                        Email{" "}
                        {column.getIsSorted() === "asc"
                          ? "^"
                          : column.getIsSorted() === "desc"
                            ? "v"
                            : "-"}
                      </ButtonText>
                    </Button>
                  ) : (
                    <Text className="font-semibold text-foreground">
                      {String(column.columnDef.header ?? column.id)}
                    </Text>
                  )}
                </View>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-secondary" : ""}
                >
                  {visibleColumns.map((column) => (
                    <View
                      key={column.id}
                      className="min-w-28 flex-1 justify-center"
                    >
                      <PaymentCell
                        columnId={column.id}
                        payment={row.original}
                        selected={row.getIsSelected()}
                        onSelect={(checked) => row.toggleSelected(checked)}
                      />
                    </View>
                  ))}
                </TableRow>
              ))
            ) : (
              <View className="p-6">
                <Text className="text-center text-muted-foreground">
                  No results.
                </Text>
              </View>
            )}
          </TableBody>
        </Table>
      </ScrollView>
      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </Text>
        <View className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onPress={() => table.previousPage()}
          >
            <ButtonText className="text-foreground">Previous</ButtonText>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onPress={() => table.nextPage()}
          >
            <ButtonText className="text-foreground">Next</ButtonText>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

function PaymentCell({
  columnId,
  payment,
  selected,
  onSelect
}: {
  columnId: string;
  payment: Payment;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}) {
  if (columnId === "select") {
    return <Checkbox checked={selected} onCheckedChange={onSelect} />;
  }
  if (columnId === "actions") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onPress={async () => {
          await copyText(payment.id);
          Alert.alert("Copied", `Payment ID ${payment.id} copied.`);
        }}
      >
        <ButtonText className="text-foreground">Copy ID</ButtonText>
      </Button>
    );
  }
  if (columnId === "amount") {
    return (
      <Text className="font-medium text-foreground">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        }).format(payment.amount)}
      </Text>
    );
  }
  if (columnId === "status") {
    return (
      <Text className="text-foreground">
        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
      </Text>
    );
  }
  return <Text className="text-foreground">{payment.email.toLowerCase()}</Text>;
}
