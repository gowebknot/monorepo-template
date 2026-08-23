"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const paymentData: Payment[] = [
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

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        data-testid="next-payments-select-all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        data-testid="next-payments-select-row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    )
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        data-testid="next-payments-sort-email"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="next-payment-actions-trigger">
            <Button
              data-testid="next-payment-actions-button"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="next-payment-actions-content"
            align="end"
          >
            <DropdownMenuLabel data-testid="next-payment-actions-label">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              data-testid="next-payment-copy-id"
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator data-testid="next-payment-actions-separator" />
            <DropdownMenuItem data-testid="next-payment-view-customer">
              View customer
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="next-payment-view-details">
              View payment details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
