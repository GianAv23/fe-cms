import RequiredLabel from "@/components/RequiredLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useApi, {
  useErrorToastHandler,
  type ResponseModel,
} from "@/hooks/use-api";
import useAuth from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useNavigate, type Path } from "@/router";
import { type UserData, type Users } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import z from "zod";
import { columns } from "./_columns";
import { DataTable } from "./_data-table";
import questionImg from "/animation/question.png";

type SheetState = {
  user?: UserData;
  mode: "create" | "edit" | "delete";
};

const rolesArray = z.array(
  z.enum(["ADMIN", "NEWS_EDITOR", "ADS_EDITOR", "DELETED"]),
);

const userSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    )
    .optional(),
  roles: rolesArray.refine((roles) => roles.length > 0, {
    message: "At least one role must be selected",
  }),
});

type UserFormFillable = z.infer<typeof userSchema>;

const Users = () => {
  const auth = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const errorHandler = useErrorToastHandler();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [searchParams, _] = useSearchParams();

  const pageFromURL = parseInt(searchParams.get("page") || "1", 10);
  const limitFromURL = parseInt(searchParams.get("limit") || "10", 10);

  const [currentPage, setCurrentPage] = useState(pageFromURL);
  const [pageSize, setPageSize] = useState(limitFromURL);

  const userData = useSWR<Users>(() => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", pageSize.toString());
    return `/users/all?${params.toString()}`;
  });

  const totalUsers = userData.data?.total || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const [sheetState, setSheetState] = useState<SheetState | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToApprove, setUserToApprove] = useState<UserData | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const handleEdit = (user: UserData) => {
    console.log("Editing user:", user);

    setSheetState({
      mode: "edit",
      user: user,
    });
    setSheetOpen(true);
  };

  const handleDelete = (user: UserData) => {
    setUserToDelete(user);
    setDialogOpen(true);
  };

  const handleApprove = (user: UserData) => {
    setUserToApprove(user);
    setApproveDialogOpen(true);
  };

  const form = useForm<UserFormFillable>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      roles: [],
    },
  });
  const { handleSubmit, control, reset } = form;

  useEffect(() => {
    if (auth.status === "loading") return;

    const allowedRoles = ["ADMIN"];

    const hasAccess = auth.user?.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasAccess) {
      toast.error("You are not authorized to access this page.");
      navigate("/login");
    }
  }, [auth]);

  useEffect(() => {
    if (sheetState?.mode === "edit" && sheetState.user) {
      reset({
        full_name: sheetState.user.full_name,
        email: sheetState.user.email,
        roles: sheetState.user.roles,
      });
    } else {
      reset({
        full_name: "",
        email: "",
        password: "",
        roles: [],
      });
    }
  }, [sheetState, reset]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", pageSize.toString());

    navigate(`?${params.toString()}` as Path, {
      replace: true,
    });

    userData.mutate();
  }, [currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(pageFromURL);
    setPageSize(limitFromURL);
  }, [pageFromURL, limitFromURL]);

  return (
    <>
      <div className="m-1 flex min-h-svh flex-col gap-4 rounded-xl border bg-white p-2">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-md">
          <div className="flex w-full items-center justify-between p-2">
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">Users</h1>
              <p className="text-muted-foreground w-60 text-sm md:w-full">
                Show all users registered in the system. You can create, edit,
                or delete users.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSheetState({ mode: "create" });
                setSheetOpen(true);
              }}
            >
              Create
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <DataTable
              columns={columns}
              data={userData.data?.users ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalUsers}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={userData.isLoading}
              currentUser={auth.user}
            />
          </div>
        </div>
      </div>

      {/* Dialog Start */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col justify-center p-4 md:max-w-lg">
          <DialogHeader className="flex flex-col items-center">
            <img src={questionImg} alt="Question" className="mb-6 w-14" />
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to delete {userToDelete?.email}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse md:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-primary flex-1"
              onClick={() => {
                if (!userToDelete) return;
                api
                  .delete<ResponseModel<UserData>>(
                    `/users/${userToDelete.uuid}`,
                  )
                  .then((response) => {
                    toast.success("User deleted successfully", {
                      description: response.data.response.message,
                    });
                  })
                  .catch((error) => {
                    errorHandler(error);
                  })
                  .finally(() => {
                    userData.mutate();
                    closeRef.current?.click();
                  });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog End */}

      {/* Approve Dialog Start */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="flex flex-col justify-center p-4 md:max-w-lg">
          <DialogHeader className="flex flex-col items-center">
            <img src={questionImg} alt="Question" className="mb-6 w-14" />
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to approve {userToApprove?.email}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse md:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-primary flex-1"
              onClick={() => {
                if (!userToApprove) return;
                api
                  .patch<ResponseModel<UserData>>(
                    `/users/approve/${userToApprove.uuid}`,
                  )
                  .then((response) => {
                    toast.success("User approved successfully", {
                      description: response.data.response.message,
                    });
                  })
                  .catch((error) => {
                    errorHandler(error);
                  })
                  .finally(() => {
                    userData.mutate();
                    setApproveDialogOpen(false);
                  });
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Approve Dialog End */}

      {/* Sheet Start */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-screen lg:min-w-2xl">
          {/* Header Start */}
          <SheetHeader>
            {sheetState?.mode === "create" ? (
              <>
                <SheetTitle>Create User</SheetTitle>
                <SheetDescription>
                  Fill in the details below to create a new user.
                </SheetDescription>
              </>
            ) : (
              <>
                <SheetTitle>Edit User</SheetTitle>
                <SheetDescription>
                  Fill in the details below to edit the user.
                </SheetDescription>
              </>
            )}
          </SheetHeader>
          {/* Header End */}

          <ScrollArea className="h-[calc(100vh-200px)] w-full">
            {/* Form Start */}
            {sheetState?.mode === "create" && (
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <Form {...form}>
                  <form
                    id="user-form"
                    onSubmit={handleSubmit(async (data) => {
                      await api
                        .post<ResponseModel<UserData>>("/users/add-user", data)

                        .then((response) => {
                          toast.success("User created successfully", {
                            description: response.data.response.message,
                          });
                        })

                        .catch((error) => {
                          errorHandler(error);
                        })
                        .finally(() => {
                          userData.mutate();
                          closeRef.current?.click();
                        });
                    })}
                    className="space-y-6"
                  >
                    {/* Fullname Start */}
                    <FormField
                      control={control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="full_name">
                            <RequiredLabel>Full Name</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="full_name"
                              placeholder="Enter Full Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fullname End */}

                    {/* Email Start */}
                    <FormField
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="email">
                            <RequiredLabel>Email</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              placeholder="Enter Email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Email End */}

                    {/* Password Start */}
                    <FormField
                      control={control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="password">
                            <RequiredLabel>Password</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              id="password"
                              placeholder="Enter User Password"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Password End */}

                    {/* Roles Field Start*/}
                    <FormField
                      control={control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <RequiredLabel>Roles</RequiredLabel>
                          </FormLabel>
                          <div className="relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value?.length &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    {field.value?.length &&
                                    field.value?.length > 0
                                      ? `${field.value.length} role${field.value.length > 1 ? "s" : ""} selected`
                                      : "Select roles"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search role..." />
                                  <CommandEmpty>No role found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandList>
                                      {[
                                        "ADMIN",
                                        "NEWS_EDITOR",
                                        "ADS_EDITOR",
                                      ].map((role) => {
                                        const typedRole = role as
                                          | "ADMIN"
                                          | "NEWS_EDITOR"
                                          | "ADS_EDITOR";
                                        const isSelected = (
                                          field.value as (
                                            | "ADMIN"
                                            | "NEWS_EDITOR"
                                            | "ADS_EDITOR"
                                          )[]
                                        )?.includes(typedRole);
                                        return (
                                          <CommandItem
                                            key={typedRole}
                                            value={typedRole}
                                            onSelect={() => {
                                              const updatedRoles = isSelected
                                                ? (
                                                    field.value as (
                                                      | "ADMIN"
                                                      | "NEWS_EDITOR"
                                                      | "ADS_EDITOR"
                                                    )[]
                                                  ).filter(
                                                    (r) => r !== typedRole,
                                                  )
                                                : [
                                                    ...((field.value as (
                                                      | "ADMIN"
                                                      | "NEWS_EDITOR"
                                                      | "ADS_EDITOR"
                                                    )[]) || []),
                                                    typedRole,
                                                  ];
                                              field.onChange(updatedRoles);
                                            }}
                                          >
                                            <div
                                              className={cn(
                                                "border-primary mr-2 flex h-6 w-6 items-center justify-center rounded-sm border",
                                                isSelected
                                                  ? "bg-primary"
                                                  : "opacity-50 [&_svg]:invisible",
                                              )}
                                            >
                                              <Check className="h-4 w-4 text-white" />
                                            </div>
                                            <span>{typedRole}</span>
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandList>
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            {/* Display selected roles as badges */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {field.value?.map((role: string) => (
                                <Badge
                                  key={role}
                                  variant="secondary"
                                  className="mr-1 mb-1"
                                >
                                  {role}
                                  <button
                                    type="button"
                                    className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                                    onClick={() => {
                                      field.onChange(
                                        (field.value ?? []).filter(
                                          (r: string) => r !== role,
                                        ),
                                      );
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Roles Field End*/}
                  </form>
                </Form>
              </div>
            )}

            {sheetState?.mode === "edit" && (
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <Form {...form}>
                  <form
                    id="edit-form"
                    onSubmit={handleSubmit(async (data) => {
                      if (!sheetState?.user) {
                        console.error("No user data available for editing");
                        return;
                      }

                      if (!sheetState.user.uuid) {
                        toast.error("User ID is missing, cannot update");
                        return;
                      }

                      const roleData = {
                        roles: data.roles,
                      };

                      await api
                        .patch<ResponseModel<UserData>>(
                          `/users/update-role/${sheetState.user.uuid}`,
                          roleData,
                        )
                        .then((response) => {
                          console.log("API response:", response);
                          toast.success("User updated successfully", {
                            description: response.data.response.message,
                          });
                        })
                        .catch((error) => {
                          console.error("API error:", error);
                          errorHandler(error);
                        })
                        .finally(() => {
                          userData.mutate();
                          closeRef.current?.click();
                        });

                      console.log("Edit form data:", data);
                    })}
                    className="space-y-4"
                  >
                    {/* Roles Field Start*/}
                    <FormField
                      control={control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roles</FormLabel>
                          <div className="relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value?.length &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    {field.value?.length &&
                                    field.value?.length > 0
                                      ? `${field.value.length} role${field.value.length > 1 ? "s" : ""} selected`
                                      : "Select roles"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search role..." />
                                  <CommandEmpty>No role found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandList>
                                      {[
                                        "ADMIN",
                                        "NEWS_EDITOR",
                                        "ADS_EDITOR",
                                      ].map((role) => {
                                        const typedRole = role as
                                          | "ADMIN"
                                          | "NEWS_EDITOR"
                                          | "ADS_EDITOR";
                                        const isSelected = (
                                          field.value as (
                                            | "ADMIN"
                                            | "NEWS_EDITOR"
                                            | "ADS_EDITOR"
                                          )[]
                                        )?.includes(typedRole);
                                        return (
                                          <CommandItem
                                            key={typedRole}
                                            value={typedRole}
                                            onSelect={() => {
                                              const updatedRoles = isSelected
                                                ? (
                                                    field.value as (
                                                      | "ADMIN"
                                                      | "NEWS_EDITOR"
                                                      | "ADS_EDITOR"
                                                    )[]
                                                  ).filter(
                                                    (r) => r !== typedRole,
                                                  )
                                                : [
                                                    ...((field.value as (
                                                      | "ADMIN"
                                                      | "NEWS_EDITOR"
                                                      | "ADS_EDITOR"
                                                    )[]) || []),
                                                    typedRole,
                                                  ];
                                              field.onChange(updatedRoles);
                                            }}
                                          >
                                            <div
                                              className={cn(
                                                "border-primary mr-2 flex h-6 w-6 items-center justify-center rounded-sm border",
                                                isSelected
                                                  ? "bg-primary"
                                                  : "opacity-50 [&_svg]:invisible",
                                              )}
                                            >
                                              <Check className="h-4 w-4 text-white" />
                                            </div>
                                            <span>{typedRole}</span>
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandList>
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            {/* Display selected roles as badges */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {field.value?.map((role: string) => (
                                <Badge
                                  key={role}
                                  variant="secondary"
                                  className="mr-1 mb-1"
                                >
                                  {role}
                                  <button
                                    type="button"
                                    className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                                    onClick={() => {
                                      field.onChange(
                                        (field.value ?? []).filter(
                                          (r: string) => r !== role,
                                        ),
                                      );
                                    }}
                                  >
                                    {role !== "USER" ? (
                                      <X className="h-3 w-3" />
                                    ) : null}
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Roles Field End*/}
                  </form>
                </Form>
              </div>
            )}

            {/* Form End */}
          </ScrollArea>

          {/* Footer Start */}
          <SheetFooter className="flex w-full flex-col-reverse md:flex-row">
            <SheetClose asChild ref={closeRef}>
              <Button variant="outline" className="flex-1">
                Close
              </Button>
            </SheetClose>

            {sheetState?.mode === "create" && (
              <Button type="submit" form="user-form" className="flex-1">
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            )}
            {sheetState?.mode === "edit" && (
              <Button type="submit" form="edit-form" className="flex-1">
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            )}
          </SheetFooter>
          {/* Footer End */}
        </SheetContent>
      </Sheet>
      {/* Sheet End */}
    </>
  );
};

export default Users;
