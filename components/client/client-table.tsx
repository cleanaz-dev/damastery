// components/client-table.tsx (or alongside your page)
"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  flexRender,
  useTable,
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  sortFns,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type {
  ClientWithRelations,
  AssignableForm,
} from "@/lib/actions/get-clients";
import { assignFormToClient } from "@/lib/actions/assign-form";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

interface ClientTableProps {
  data: ClientWithRelations[];
  forms: AssignableForm[];
}

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
});

// ---------- Assigned forms badges ----------
function AssignedForms({ client }: { client: ClientWithRelations }) {
  const assignments = [
    ...(client.profile?.assignments ?? []),
    ...client.unlinkedAssignments,
  ];

  if (assignments.length === 0) {
    return <span className="text-xs text-gray-400">None assigned</span>;
  }

  const now = new Date();

  return (
    <div className="flex flex-wrap gap-1.5 max-w-xs">
      {assignments.map((a) => {
        const expired =
          a.status === "EXPIRED" ||
          (a.status === "PENDING" && new Date(a.expiresAt) < now);

        let label = "Pending";
        let classes =
          "bg-amber-50 text-amber-700 ring-amber-600/20";
        if (a.status === "COMPLETED") {
          label = "Done";
          classes = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
        } else if (expired) {
          label = "Expired";
          classes = "bg-gray-100 text-gray-600 ring-gray-500/20";
        }

        return (
          <span
            key={a.id}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
            title={`${a.form.title} — ${label}`}
          >
            {a.form.title}
            <span className="opacity-70">· {label}</span>
          </span>
        );
      })}
    </div>
  );
}

// ---------- Assign form dropdown + button ----------
function AssignFormControl({
  userId,
  forms,
}: {
  userId: string;
  forms: AssignableForm[];
}) {
  const [formId, setFormId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!formId) return;
    setError(null);
    startTransition(async () => {
      const result = await assignFormToClient({ userId, formId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFormId("");
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <select
          value={formId}
          onChange={(e) => setFormId(e.target.value)}
          disabled={isPending}
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select form…</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={!formId || isPending}
          className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Assigning…" : "Assign"}
        </button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function ClientTable({ data, forms }: ClientTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<typeof features, ClientWithRelations>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Client
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </button>
        ),
        cell: ({ row }) => {
          const client = row.original;
          const avatar = client.avatarUrl || client.image;
          return (
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={client.name}
                  className="h-9 w-9 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 border border-slate-200">
                  {client.name?.charAt(0).toUpperCase() || "C"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{client.name}</span>
                <span className="text-xs text-gray-500">{client.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.phone || "—"}
          </span>
        ),
      },
      {
        id: "bookingsCount",
        accessorFn: (row) => row.bookings.length,
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bookings
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </button>
        ),
        cell: ({ row }) => {
          const bookings = row.original.bookings;
          const activeCount = bookings.filter(
            (b) => b.status === "BOOKED",
          ).length;
          const pendingCount = bookings.filter(
            (b) => b.status === "PENDING",
          ).length;

          return (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <Calendar className="h-3.5 w-3.5" />
                {bookings.length} total
              </span>
              {activeCount > 0 && (
                <span className="text-xs text-emerald-600 font-medium">
                  ({activeCount} booked)
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-xs text-amber-600 font-medium">
                  ({pendingCount} pending)
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "assignedForms",
        header: "Forms",
        cell: ({ row }) => <AssignedForms client={row.original} />,
      },
      {
        id: "assignForm",
        header: "Assign form",
        cell: ({ row }) => (
          <AssignFormControl userId={row.original.id} forms={forms} />
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const { banned, emailVerified } = row.original;

          if (banned) {
            return (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                <XCircle className="h-3.5 w-3.5" />
                Banned
              </span>
            );
          }

          return emailVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Unverified
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-sm text-gray-600">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
      },
    ],
    [forms],
  );

  const table = useTable({
    features,
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const name = row.original.name?.toLowerCase() || "";
      const email = row.original.email?.toLowerCase() || "";
      const phone = row.original.phone?.toLowerCase() || "";
      return (
        name.includes(search) ||
        email.includes(search) ||
        phone.includes(search)
      );
    },
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar / Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search name, email, or phone..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          clients
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-200 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-500"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3.5 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {row.getAllCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-top">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No clients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3">
          <div className="text-xs text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-900">
              {table.state.pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {table.getPageCount() || 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}