import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type UserData } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Pencil, Trash2 } from "lucide-react";

export interface ActionProps {
  row: { original: UserData };
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onApprove: (user: UserData) => void;
  currentUser?: UserData;
}

const roleColors = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-primary text-white";
    case "NEWS_EDITOR":
      return "bg-primary/20 text-primary";
    case "ADS_EDITOR":
      return "bg-primary/30 text-primary";
    default:
      return "bg-gray-100 text-black";
  }
};

export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "email",
    size: 200,
    header: ({ column }) => {
      return (
        <div
          className="flex cursor-pointer flex-row items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-600" />
        </div>
      );
    },
    cell: ({ row }) => {
      const email = row.original.email;

      if (!email) {
        return <span className="text-muted-foreground">No email provided</span>;
      }

      return email;
    },
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <div
          className="flex cursor-pointer flex-row items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-600" />
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    size: 200,
    header: ({ column }) => {
      return (
        <div
          className="flex cursor-pointer flex-row items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Roles
          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-600" />
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2">
          {row.original.roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className={cn("border-0 font-medium", roleColors(role))}
            >
              {role}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    size: 20,
    header: ({ column }) => {
      return (
        <div
          className="flex cursor-pointer flex-row items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-600" />
        </div>
      );
    },
    cell: ({ row }) => {
      const statusColors = row.original.status;

      return (
        <Badge
          variant="outline"
          className={cn(
            statusColors === "ACTIVE"
              ? "bg-black text-white"
              : "bg-black/5 text-black",
          )}
        >
          {statusColors}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    size: 100,
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "updated_at",
    size: 100,
    header: "Updated At",
    cell: ({ row }) => {
      return new Date(row.original.updated_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    id: "actions",
    header: "Actions",
    enablePinning: true,
    size: 120,
    cell: ({ row, table }) => {
      const { onEdit, onDelete, onApprove, currentUser } = table.options
        .meta as {
        onEdit: (user: UserData) => void;
        onDelete: (user: UserData) => void;
        onApprove: (user: UserData) => void;
        currentUser?: UserData;
      };

      const isRequestStatus = row.original.status === "REQUEST";
      const isActiveStatus = row.original.status === "ACTIVE";
      const isCurrentUser = currentUser?.uuid === row.original.uuid;

      return (
        <div className="flex items-center justify-start gap-2">
          {isActiveStatus && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(row.original)}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {isRequestStatus && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
              onClick={() => onApprove(row.original)}
            >
              <span className="sr-only">Approve</span>
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}

          {!isCurrentUser && (
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
              onClick={() => onDelete(row.original)}
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
