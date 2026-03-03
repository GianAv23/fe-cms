import AdsEditForm from "@/components/ads/AdsEditForm";
import type { AdsFormFillable } from "@/components/ads/AdsForm";
import AdsImage from "@/components/ads/AdsImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useNavigate, useParams, type Path } from "@/router";
import type { AdsItem } from "@/types";
import { ChevronLeft, Ellipsis, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useLocation } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import questionImg from "/animation/question.png";

type SheetState = {
  ads?: AdsItem;
  mode: "edit" | "edit-history";
};

const AdsDetail = () => {
  const auth = useAuth();
  const api = useApi();
  const location = useLocation();
  const navigate = useNavigate();
  const errorHandler = useErrorToastHandler();
  const closeRef = useRef<HTMLButtonElement>(null);
  const params = useParams("/dashboard/ads/:id");

  const [_editForm, setEditForm] =
    useState<UseFormReturn<AdsFormFillable> | null>(null);

  const handleEditSubmit = async (data: AdsFormFillable) => {
    if (!sheetState?.ads) return;

    try {
      const res = await api.patch<ResponseModel<AdsItem>>(
        `/ads/${sheetState?.ads?.uuid}`,
        data,
      );

      toast.success("Ads updated successfully", {
        description: res.data.response.message,
      });
    } catch (error) {
      errorHandler(error as any);
    } finally {
      adsData.mutate();
      closeRef.current?.click();
    }
  };

  const isAdsPage = location.pathname.includes("/dashboard/ads/");

  const adsData = useSWR<AdsItem>(
    isAdsPage && params.id ? `/ads/ads-cms/${params.id}` : null,
  );

  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  const handleImageUploadSuccess = () => {
    adsData.mutate();
    setImageRefreshKey((prev) => prev + 1);
  };

  const formatCategoryName = (category: string) => {
    if (!category) return "";

    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [sheetState, setSheetState] = useState<SheetState | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [adsToDelete, setAdsToDelete] = useState<AdsItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (auth.status === "loading") return;

    const allowedRoles = ["ADMIN", "ADS_EDITOR"];

    const hasAccess = auth.user?.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasAccess) {
      toast.error("You are not authorized to access this page.");
      navigate("/login");
    }
  }, [auth]);

  return (
    <>
      <div className="bg-muted flex min-h-svh flex-col items-center gap-4 p-4">
        {/* Navigation & Action Start */}
        <div className="flex w-full flex-row items-center justify-between">
          <Button
            variant={"outline"}
            onClick={() => navigate("/dashboard/ads")}
          >
            <ChevronLeft className="size-4" />
            <span className="text-sm">Back</span>
          </Button>
          {adsData.data?.uuid && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger>
                <Button
                  variant={"outline"}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-44" align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSheetState({ mode: "edit", ads: adsData.data });
                    setSheetOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <SquarePen />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* {adsData.data?.external_link === null ? (
                  <DropdownMenuItem
                    className="cursor-not-allowed opacity-50"
                    disabled
                  >
                    <History />
                    External Linkss
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      window.open(
                        `${adsData.data?.external_link}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="cursor-pointer"
                  >
                    <History />
                    External Link
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator /> */}
                {adsData.data && (
                  <DropdownMenuItem
                    className="hover:!text-destructive text-destructive cursor-pointer"
                    onClick={() => {
                      setAdsToDelete(adsData.data as AdsItem);
                      setDialogOpen(true);
                    }}
                  >
                    <Trash2 className="text-destructive" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Navigation & Action End */}

        <div className="flex w-full flex-col gap-4 md:w-[640px]">
          {/* Image Start */}
          <div className="flex flex-col gap-2">
            <p className="font-medium md:text-lg md:font-semibold">
              {adsData.data?.title}
            </p>
            {adsData.data && adsData.data.uuid && (
              <AdsImage
                ads_uuid={adsData.data?.uuid}
                refreshKey={imageRefreshKey}
                className="h-[180px] w-full object-cover md:h-[360px] md:w-[640px]"
                onClick={() => {
                  navigate(`/dashboard/ads/${adsData.data?.uuid}` as Path);
                }}
              />
            )}
          </div>
          {/* Image End */}

          {/* Published Status, Category, Created Date Start*/}
          <div className="bg-red flex flex-row justify-between">
            {/* Published Status & Category */}
            <div className="flex flex-row items-center gap-2">
              <Badge variant={adsData.data?.published ? "default" : "outline"}>
                {adsData.data?.published ? "Published" : "Draft"}
              </Badge>
              {adsData.data?.category && (
                <p className="text-muted-foreground text-sm font-medium">
                  {formatCategoryName(adsData.data?.category)}
                </p>
              )}
            </div>

            {/* Created Date and Time */}
            <div className="text-muted-foreground text-sm font-medium">
              {adsData.data?.updated_at
                ? `${new Date(adsData.data.updated_at).toLocaleDateString(
                    "id-ID",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    },
                  )} (${new Date(adsData.data.updated_at).toLocaleTimeString(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )} WIB)`
                : "Unknown Date"}
            </div>
          </div>
          {/* Published Status, Category, Created Date End */}

          <div className="text-justify text-sm">{adsData.data?.content}</div>
        </div>
      </div>

      {/* Dialog Start */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col justify-center p-4 md:max-w-lg">
          <DialogHeader className="flex flex-col items-center">
            <img src={questionImg} alt="Question" className="mb-6 w-14" />
            <DialogTitle>Delete Ads</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to delete {adsToDelete?.title}?
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
                if (!adsToDelete) return;

                api
                  .delete<ResponseModel<AdsItem>>(`/ads/${adsToDelete.uuid}`)
                  .then((response) => {
                    toast.success("Ads deleted successfully", {
                      description: response.data.response.message,
                    });

                    setDialogOpen(false);

                    navigate("/dashboard/ads");
                  })
                  .catch((error) => {
                    errorHandler(error);
                  });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog End */}

      {/* Sheet Start */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-screen lg:min-w-2xl">
          {/* Header Start */}
          <SheetHeader>
            <SheetTitle>
              {sheetState?.mode === "edit" ? "Edit Ads" : "Ads History"}
            </SheetTitle>
            <SheetDescription>
              {sheetState?.mode === "edit"
                ? "Fill in the details below to edit the ads item."
                : "View the edit history for this ads item."}
            </SheetDescription>
          </SheetHeader>
          {/* Header End */}

          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="w-full">
              {/* Form Start */}
              {sheetState?.mode === "edit" && sheetState.ads && (
                <AdsEditForm
                  formId="edit-form"
                  ads={sheetState.ads}
                  imageRefreshKey={imageRefreshKey}
                  onSubmit={handleEditSubmit}
                  onFormChange={setEditForm}
                  onImageUploadSuccess={handleImageUploadSuccess}
                />
              )}
              {/* Form End */}

              {/* {sheetState?.mode === "edit-history" && (
                <>
                  <div className="grid flex-1 auto-rows-min gap-6 px-4 py-2">
                    {Array.isArray(newsData.data?.AdminNews) &&
                      newsData.data.AdminNews.length > 0 &&
                      newsData.data.AdminNews.map((adminNews) => (
                        <div
                          className="text-muted-foreground text-sm font-medium"
                          key={adminNews.UserInformation.User.email}
                        >
                          {adminNews.created_by === true ? (
                            <span className="text-primary">
                              Created By: {adminNews.UserInformation.full_name}
                            </span>
                          ) : (
                            <span className="text-foreground">
                              {adminNews.UserInformation.full_name}
                            </span>
                          )}

                          {adminNews?.UserInformation?.User?.email && (
                            <span className="ml-1">
                              ({adminNews.UserInformation.User.email})
                            </span>
                          )}
                          {adminNews?.created_at && (
                            <span className="ml-1">
                              on{" "}
                              {new Date(
                                adminNews.created_at,
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}{" "}
                              (
                              {new Date(
                                adminNews.created_at,
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              WIB)
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )} */}
            </ScrollArea>
          </div>

          {/* Footer Start */}
          <SheetFooter className="flex w-full flex-col-reverse md:flex-row">
            <SheetClose asChild ref={closeRef}>
              <Button variant="outline" className="flex-1">
                Close
              </Button>
            </SheetClose>

            {sheetState?.mode === "edit" && (
              <Button type="submit" form="edit-form" className="flex-1">
                Save
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

export default AdsDetail;
