import AdsCard from "@/components/ads/AdsCard";
import AdsEditForm from "@/components/ads/AdsEditForm";
import type { AdsFormFillable } from "@/components/ads/AdsForm";
import AdsForm from "@/components/ads/AdsForm";
import Loader from "@/components/Loader";
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
import { type Ads, type AdsItem } from "@/types";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import notfoundImg from "/animation/not-found.png";
import questionImg from "/animation/question.png";

type SheetState = {
  ads?: AdsItem;
  mode: "create" | "edit" | "delete";
};

const Ads = () => {
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

  const [_createForm, setCreateForm] =
    useState<UseFormReturn<AdsFormFillable> | null>(null);
  const [_editForm, setEditForm] =
    useState<UseFormReturn<AdsFormFillable> | null>(null);

  const handleCreateSubmit = async (data: AdsFormFillable) => {
    try {
      const res = await api.post<ResponseModel<Ads>>("/ads/create", data);

      toast.success("Ads created successfully", {
        description: res.data.response.message,
      });
    } catch (error) {
      errorHandler(error as any);
    } finally {
      adsData.mutate();
      closeRef.current?.click();
    }
  };

  const handleEditSubmit = async (data: AdsFormFillable) => {
    if (!sheetState?.ads) return;

    try {
      const response = await api.patch<ResponseModel<Ads>>(
        `/ads/${sheetState.ads.uuid}`,
        data,
      );
      toast.success("Ads updated successfully", {
        description: response.data.response.message,
      });
    } catch (error) {
      errorHandler(error as any);
    } finally {
      adsData.mutate();
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

  const adsData = useSWR<Ads>(() => {
    let url = "/ads/ads-cms";

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

  const filteredAds = useMemo(() => {
    return adsData.data?.ads || [];
  }, [adsData.data]);

  const totalAds = adsData.data?.total || 0;
  const totalPages = Math.ceil(totalAds / pageSize);

  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  const handleImageUploadSuccess = () => {
    adsData.mutate();
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

    adsData.mutate();
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

    adsData.mutate();
  };

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

  // Function to render the list of ads items with category filtering
  function renderAdsList(adsItems: AdsItem[]) {
    if (adsData.isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader />
        </div>
      );
    }

    if (!adsItems || adsItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <img src={notfoundImg} alt="No ads found" className="mb-6 w-24" />
          <p className="text-muted-foreground text-sm">
            No ads found, click Create to add one
          </p>
        </div>
      );
    }

    return adsItems.map((ads: AdsItem) => (
      <AdsCard
        key={ads.uuid}
        ads={ads}
        imageRefreshKey={imageRefreshKey}
        onEditClick={(ads) => {
          setSheetState({ mode: "edit", ads });
          setSheetOpen(true);
        }}
        onDeleteClick={(ads) => {
          setAdsToDelete(ads);
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
            <h1 className="text-xl font-semibold md:text-2xl">Ads</h1>
            <p className="text-muted-foreground w-48 text-sm md:w-full">
              Here you can find the latest ads and updates
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
              placeholder="Search ads by title or content..."
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
              Found {filteredAds.length}{" "}
              {filteredAds.length === 1 ? "result" : "results"} for "
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
              Internal
            </TabsTrigger>
            <TabsTrigger value="EXTERNAL" className="cursor-pointer">
              External
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ALL">{renderAdsList(filteredAds)}</TabsContent>

          <TabsContent value="INTERNAL">
            {renderAdsList(filteredAds)}
          </TabsContent>

          <TabsContent value="EXTERNAL">
            {renderAdsList(filteredAds)}
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        {filteredAds.length > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-muted-foreground text-sm">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalAds)} of {totalAds}
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
                  .delete<ResponseModel<Ads>>(`/ads/${adsToDelete.uuid}`)
                  .then((response) => {
                    toast.success("Ads deleted successfully", {
                      description: response.data.response.message,
                    });
                  })
                  .catch((error) => {
                    errorHandler(error);
                  })
                  .finally(() => {
                    adsData.mutate();
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
                <SheetTitle>Create Ads</SheetTitle>
                <SheetDescription>
                  Fill in the details below to add a new ad.
                </SheetDescription>
              </>
            ) : (
              <>
                <SheetTitle>Edit Ads</SheetTitle>
                <SheetDescription>
                  Fill in the details below to edit the ad.
                </SheetDescription>
              </>
            )}
          </SheetHeader>
          {/* Header End */}

          {/* Form Start */}
          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="w-full">
              {sheetState?.mode === "create" && (
                <AdsForm
                  mode="create"
                  formId="ads-form"
                  onSubmit={handleCreateSubmit}
                  onFormChange={setCreateForm}
                />
              )}

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
              <Button type="submit" form="ads-form" className="flex-1">
                Save
              </Button>
            )}
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

export default Ads;
