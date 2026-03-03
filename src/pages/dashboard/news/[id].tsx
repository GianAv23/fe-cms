import NewsEditForm from "@/components/news/NewsEditForm";
import { type NewsFormFillable } from "@/components/news/NewsForm";
import NewsImage from "@/components/news/NewsImage";
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
import type { NewsItem } from "@/types";
import DOMPurify from "isomorphic-dompurify";
import {
  ChevronLeft,
  Ellipsis,
  History,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useLocation } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import questionImg from "/animation/question.png";

type SheetState = {
  news?: NewsItem;
  mode: "edit" | "edit-history";
};

const NewsDetail = () => {
  const auth = useAuth();
  const api = useApi();
  const location = useLocation();
  const navigate = useNavigate();
  const errorHandler = useErrorToastHandler();
  const closeRef = useRef<HTMLButtonElement>(null);
  const params = useParams("/dashboard/news/:id");

  const [editForm, setEditForm] =
    useState<UseFormReturn<NewsFormFillable> | null>(null);

  const handleEditSubmit = async (data: NewsFormFillable) => {
    if (!sheetState?.news) return;

    try {
      const res = await api.patch<ResponseModel<NewsItem>>(
        `/news/${sheetState?.news?.uuid}`,
        data,
      );

      toast.success("News updated successfully", {
        description: res.data.response.message,
      });
    } catch (error) {
      errorHandler(error as any);
    } finally {
      newsData.mutate();
      closeRef.current?.click();
    }
  };

  // Check if the current page is an news page to conditionally fetch data
  const isNewsPage = location.pathname.includes("/dashboard/news/");

  // Fetch news data
  const newsData = useSWR<NewsItem>(
    isNewsPage && params.id ? `/news/news-cms/${params.id}` : null,
  );

  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  const handleImageUploadSuccess = () => {
    // Increment the refresh counter to force re-fetch of image
    newsData.mutate();
    setImageRefreshKey((prev) => prev + 1);
  };

  // Replace underscores with spaces and capitalize each word
  const formatCategoryName = (category: string) => {
    if (!category) return "";

    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State to manage the sheet state for create/edit modes
  const [sheetState, setSheetState] = useState<SheetState | undefined>();

  // State to control the sheet open/close
  const [sheetOpen, setSheetOpen] = useState(false);

  // State to manage the news item to delete
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);

  // State to manage dialog open/close
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (auth.status === "loading") return;

    const adsEditorOnly =
      auth.user?.roles?.length === 1 && auth.user.roles.includes("ADS_EDITOR");

    if (adsEditorOnly) {
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
            onClick={() => navigate("/dashboard/news")}
          >
            <ChevronLeft className="size-4" />
            <span className="text-sm">Back</span>
          </Button>
          {newsData.data?.uuid && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger>
                <Button
                  variant={"outline"}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-32" align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSheetState({ mode: "edit", news: newsData.data });
                    setSheetOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <SquarePen />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSheetState({
                      mode: "edit-history",
                      news: newsData.data,
                    });
                    setSheetOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <History />
                  History Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {newsData.data && (
                  <DropdownMenuItem
                    className="hover:!text-destructive text-destructive cursor-pointer"
                    onClick={() => {
                      setNewsToDelete(newsData.data as NewsItem);
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
              {newsData.data?.title}
            </p>
            {newsData.data && newsData.data.uuid && (
              <NewsImage
                news_uuid={newsData.data?.uuid}
                refreshKey={imageRefreshKey}
                className="h-[180px] w-full bg-white object-cover md:h-[360px] md:w-[640px]"
                onClick={() => {
                  navigate(`/dashboard/news/${newsData.data?.uuid}` as Path);
                }}
              />
            )}
          </div>
          {/* Image End */}

          {/* Published Status, Category, Created Date Start*/}
          <div className="bg-red flex flex-row justify-between">
            {/* Published Status & Category */}
            <div className="flex flex-row items-center gap-2">
              <Badge variant={newsData.data?.published ? "default" : "outline"}>
                {newsData.data?.published ? "Published" : "Draft"}
              </Badge>
              {newsData.data?.category && (
                <p className="text-muted-foreground text-sm font-medium">
                  {formatCategoryName(newsData.data?.category)}
                </p>
              )}
            </div>

            {/* Created Date and Time */}
            <div className="text-muted-foreground text-sm font-medium">
              {newsData.data?.updated_at
                ? `${new Date(newsData.data.updated_at).toLocaleDateString(
                    "id-ID",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    },
                  )} (${new Date(newsData.data.updated_at).toLocaleTimeString(
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

          <div className="pt-2 text-justify text-sm">
            <div
              className="prose prose-sm prose-h1:text-2xl/8 prose-h2:text-xl prose-h3:text-lg prose-ol:list-decimal prose-ol:text-sm/2 prose-ul:list-disc prose-ul:text-sm/2 prose-content max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(newsData.data?.content ?? ""),
              }}
            />
          </div>
        </div>
      </div>

      {/* Dialog Start */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col justify-center p-4 md:max-w-lg">
          <DialogHeader className="flex flex-col items-center">
            <img src={questionImg} alt="Question" className="mb-6 w-14" />
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Are you sure you want to delete {newsToDelete?.title}?
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
                if (!newsToDelete) return;

                api
                  .delete<ResponseModel<NewsItem>>(`/news/${newsToDelete.uuid}`)
                  .then((response) => {
                    toast.success("News deleted successfully", {
                      description: response.data.response.message,
                    });

                    setDialogOpen(false);

                    navigate("/dashboard/news");
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
              {sheetState?.mode === "edit" ? "Edit News" : "Edit News History"}
            </SheetTitle>
            <SheetDescription>
              {sheetState?.mode === "edit"
                ? "Fill in the details below to edit the news item."
                : "View the edit history for this news item."}
            </SheetDescription>
          </SheetHeader>
          {/* Header End */}

          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="w-full">
              {/* Form Start */}
              {sheetState?.mode === "edit" && sheetState.news && (
                <NewsEditForm
                  formId="edit-form"
                  news={sheetState.news}
                  imageRefreshKey={imageRefreshKey}
                  onSubmit={handleEditSubmit}
                  onFormChange={setEditForm}
                  onImageUploadSuccess={handleImageUploadSuccess}
                />
              )}
              {/* Form End */}

              {sheetState?.mode === "edit-history" && (
                <>
                  <div className="grid flex-1 auto-rows-min gap-2 px-4 py-2">
                    {Array.isArray(newsData.data?.AdminNews) &&
                      newsData.data.AdminNews.length > 0 &&
                      newsData.data.AdminNews.map((adminNews) => (
                        <div
                          className="text-muted-foreground text-sm font-medium"
                          key={adminNews.User.email}
                        >
                          {adminNews.created_by === true ? (
                            <span className="text-primary">
                              Created By: {adminNews.User.full_name}
                            </span>
                          ) : (
                            <span className="text-foreground">
                              Updated By: {adminNews.User.full_name}
                            </span>
                          )}

                          {adminNews.User?.email && (
                            <span className="ml-1">
                              ({adminNews.User.email})
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
              )}
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
              <Button
                type="submit"
                form="edit-form"
                className="flex-1"
                disabled={editForm?.formState.isSubmitting}
              >
                {editForm?.formState.isSubmitting ? "Saving..." : "Save"}
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

export default NewsDetail;
