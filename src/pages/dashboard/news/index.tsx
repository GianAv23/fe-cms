import Loader from "@/components/Loader";
import NewsCard from "@/components/news/NewsCard";
import NewsEditForm from "@/components/news/NewsEditForm";
import NewsForm, { type NewsFormFillable } from "@/components/news/NewsForm";
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
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useApi, {
  useErrorToastHandler,
  type ResponseModel,
} from "@/hooks/use-api";
import useAuth from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { useNavigate, type Path } from "@/router";
import { type News, type NewsItem } from "@/types";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import notfoundImg from "/animation/not-found.png";
import questionImg from "/animation/question.png";

type SheetState = {
  news?: NewsItem;
  mode: "create" | "edit" | "delete";
};

const News = () => {
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

  const [createForm, setCreateForm] =
    useState<UseFormReturn<NewsFormFillable> | null>(null);
  const [editForm, setEditForm] =
    useState<UseFormReturn<NewsFormFillable> | null>(null);

  const handleCreateSubmit = async (data: NewsFormFillable) => {
    try {
      const res = await api.post<ResponseModel<News>>("/news/create", data);

      toast.success("News created successfully", {
        description: res.data.response.message,
      });
    } catch (error) {
      errorHandler(error as any);
    } finally {
      newsData.mutate();
      closeRef.current?.click();
    }
  };

  const handleEditSubmit = async (data: NewsFormFillable) => {
    if (!sheetState?.news) return;

    try {
      const response = await api.patch<ResponseModel<News>>(
        `/news/${sheetState.news.uuid}`,
        data,
      );

      toast.success("News updated successfully", {
        description: response.data.response.message,
      });
    } catch (error) {
      errorHandler(error as any);
    } finally {
      newsData.mutate();
      closeRef.current?.click();
    }
  };

  const categoryFromURL =
    (searchParams.get("category") as "ALL" | "INTERNAL" | "EXTERNAL") || "ALL";

  const validCategory = ["ALL", "INTERNAL", "EXTERNAL"].includes(
    categoryFromURL,
  )
    ? categoryFromURL
    : "ALL";

  const [activeCategory, setActiveCategory] = useState<
    "ALL" | "INTERNAL" | "EXTERNAL"
  >(validCategory);

  const queryFromURL = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState<string>(queryFromURL);
  const searchQuery = useDebounce(searchInput, 300);

  const newsData = useSWR<News>(() => {
    let url = "/news/news-cms";

    const params = new URLSearchParams();

    params.append("page", currentPage.toString());
    params.append("limit", pageSize.toString());

    if (activeCategory !== "ALL") {
      params.append("category", activeCategory);
    }

    if (searchQuery) {
      params.append("search", searchQuery);
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  });

  const filteredNews = useMemo(() => {
    return newsData.data?.news || [];
  }, [newsData.data]);

  const totalNews = newsData.data?.total || 0;
  const totalPages = Math.ceil(totalNews / pageSize);

  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  const handleImageUploadSuccess = () => {
    newsData.mutate();
    setImageRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const params = new URLSearchParams();

    params.append("page", currentPage.toString());
    params.append("limit", pageSize.toString());

    if (activeCategory !== "ALL") {
      params.append("category", activeCategory);
    }

    if (searchQuery) {
      params.append("search", searchQuery);
    }

    navigate(`?${params.toString()}` as Path, {
      replace: true,
    });

    newsData.mutate();
  }, [
    searchQuery,
    activeCategory,
    navigate,
    queryFromURL,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    setCurrentPage(pageFromURL);
    setPageSize(limitFromURL);
  }, [pageFromURL, limitFromURL]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  // Function to handle category change from the tabs
  const handleCategoryChange = (value: string) => {
    const category = value as "ALL" | "INTERNAL" | "EXTERNAL";
    setActiveCategory(category);

    setCurrentPage(1);

    const params = new URLSearchParams();
    params.append("category", category);

    if (searchQuery) {
      params.append("search", searchQuery);
    }

    navigate(`?${params.toString()}` as Path, {
      replace: true,
    });

    newsData.mutate();
  };

  const [sheetState, setSheetState] = useState<SheetState | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (auth.status === "loading") return;

    const allowedRoles = ["ADMIN", "NEWS_EDITOR"];

    const hasAccess = auth.user?.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasAccess) {
      toast.error("You are not authorized to access this page.");
      navigate("/login");
    }
  }, [auth]);

  function renderNewsList(newsItems: NewsItem[]) {
    if (newsData.isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader />
        </div>
      );
    }

    if (!newsItems || newsItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <img src={notfoundImg} alt="No news found" className="mb-6 w-24" />
          <p className="text-muted-foreground text-sm">
            No news found, click Create to add one
          </p>
        </div>
      );
    }

    return newsItems.map((news: NewsItem) => (
      <NewsCard
        key={news.uuid}
        news={news}
        imageRefreshKey={imageRefreshKey}
        onEditClick={(news) => {
          setSheetState({ mode: "edit", news });
          setSheetOpen(true);
        }}
        onDeleteClick={(news) => {
          setNewsToDelete(news);
          setDialogOpen(true);
        }}
      />
    ));
  }

  return (
    <>
      <div className="m-1 flex min-h-svh flex-col gap-4 rounded-xl border bg-white p-2">
        <div className="flex flex-row items-center justify-between p-2">
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">News</h1>
            <p className="text-muted-foreground w-48 text-sm md:w-full">
              Here you can find the latest news and updates
            </p>
          </div>
          <div>
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
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search news by title or content..."
              className="md:text-md pr-10 pl-10 text-sm"
              value={searchInput}
              onChange={handleSearchInput}
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-full p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {searchQuery && (
            <div className="text-muted-foreground mt-2 text-sm">
              Found {filteredNews.length}{" "}
              {filteredNews.length === 1 ? "result" : "results"} for "
              {searchQuery}"
            </div>
          )}
        </div>

        <Tabs
          defaultValue="ALL"
          value={activeCategory}
          onValueChange={handleCategoryChange}
        >
          <TabsList className="mb-2 gap-2">
            <TabsTrigger value="ALL" className="cursor-pointer">
              All
            </TabsTrigger>
            <TabsTrigger value="INTERNAL" className="cursor-pointer">
              Internal{" "}
            </TabsTrigger>
            <TabsTrigger value="EXTERNAL" className="cursor-pointer">
              External
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ALL">{renderNewsList(filteredNews)}</TabsContent>

          <TabsContent value="INTERNAL">
            {renderNewsList(filteredNews)}
          </TabsContent>

          <TabsContent value="EXTERNAL">
            {renderNewsList(filteredNews)}
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        {filteredNews.length > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-muted-foreground text-sm">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalNews)} of {totalNews}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
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
                  .delete<ResponseModel<News>>(`/news/${newsToDelete.uuid}`)
                  .then((response) => {
                    toast.success("News deleted successfully", {
                      description: response.data.response.message,
                    });
                  })
                  .catch((error) => {
                    errorHandler(error);
                  })
                  .finally(() => {
                    newsData.mutate();
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

      {/* Sheet Start */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-screen lg:min-w-2xl">
          {/* Header Start */}
          <SheetHeader>
            {sheetState?.mode === "create" ? (
              <>
                <SheetTitle>Create News</SheetTitle>
                <SheetDescription>
                  Fill in the details below to add a new news item.
                </SheetDescription>
              </>
            ) : (
              <>
                <SheetTitle>Edit News</SheetTitle>
                <SheetDescription>
                  Fill in the details below to edit the news item.
                </SheetDescription>
              </>
            )}
          </SheetHeader>
          {/* Header End */}

          {/* Form Start */}
          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="w-full">
              {sheetState?.mode === "create" && (
                <NewsForm
                  mode="create"
                  formId="news-form"
                  onSubmit={handleCreateSubmit}
                  onFormChange={setCreateForm}
                />
              )}

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
            </ScrollArea>
          </div>
          {/* Form End */}

          {/* Footer Start */}
          <SheetFooter className="flex w-full flex-col-reverse md:flex-row">
            <SheetClose asChild ref={closeRef}>
              <Button variant="outline" className="flex-1">
                Close
              </Button>
            </SheetClose>

            {sheetState?.mode === "create" && (
              <Button
                type="submit"
                form="news-form"
                className="flex-1"
                disabled={createForm?.formState.isSubmitting}
              >
                {createForm?.formState.isSubmitting ? "Creating..." : "Create"}
              </Button>
            )}
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

export default News;
