import { useNavigate, type Path } from "@/router";
import type { AdsItem } from "@/types";
import { Link, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import AdsImage from "./AdsImage";

interface AdsCardProps {
  ads: AdsItem;
  imageRefreshKey: number;
  onEditClick: (ads: AdsItem) => void;
  onDeleteClick: (ads: AdsItem) => void;
}

// Function to format category names
const formatCategoryName = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const AdsCard = ({
  ads,
  imageRefreshKey,
  onEditClick,
  onDeleteClick,
}: AdsCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-3 flex flex-col md:flex-row">
      <div className="bg-muted flex h-full w-full flex-col gap-4 rounded-xl p-2 md:flex-row">
        {/* Image */}
        <AdsImage
          ads_uuid={ads.uuid}
          refreshKey={imageRefreshKey}
          className="h-[180px] w-full object-top-right md:h-32 md:w-32"
          onClick={() => {
            navigate(`/dashboard/ads/${ads.uuid}` as Path);
          }}
        />

        {/* Content */}
        <div className="flex min-h-full w-full flex-col items-start justify-between gap-2 md:flex-row">
          <div
            className="flex h-full w-full flex-col gap-2"
            onClick={() => {
              navigate(`/dashboard/ads/${ads.uuid}` as Path);
            }}
          >
            <div className="flex w-full items-center gap-2">
              <Badge variant={ads.published ? "default" : "outline"}>
                {ads.published ? "Published" : "Draft"}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {formatCategoryName(ads.category)}
              </span>
            </div>
            <div className="w-full flex-1">
              <p className="md:text-md hover:text-primary line-clamp-2 cursor-pointer text-sm font-medium transition-colors duration-200 ease-in-out md:line-clamp-1">
                {ads.title}
              </p>
              <div className="hidden md:block">
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {ads.content}
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
            {/* Open Link Button - Visible on all screen sizes */}
            <Button
              size="sm"
              variant="outline"
              className="md:w-34 md:flex-none"
              onClick={() => {
                window.open(
                  `${ads.external_link}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              <Link className="mr-2 md:mr-0" />
              <p className="md:hidden">Open Link</p>
              <p className="hidden md:block">Open Link</p>
            </Button>

            {/* Delete & Edit Buttons - Only visible on desktop */}
            <div className="hidden md:flex md:gap-2">
              <Button
                size="sm"
                variant="outline"
                className="md:w-34 md:flex-none"
                onClick={() => onDeleteClick(ads)}
              >
                <Trash2 className="mr-0" />
                <p className="hidden md:block">Delete</p>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="md:w-34 md:flex-none"
                onClick={() => onEditClick(ads)}
              >
                <SquarePen className="mr-0" />
                <p className="hidden md:block">Edit</p>
              </Button>
            </div>

            {/* Mobile-only Delete & Edit Buttons in column layout */}
            <div className="flex w-full flex-row gap-2 md:hidden">
              <Button
                size="sm"
                className="flex-1"
                variant="outline"
                onClick={() => onDeleteClick(ads)}
              >
                <Trash2 className="mr-2" />
              </Button>
              <Button
                size="sm"
                className="flex-1"
                variant="outline"
                onClick={() => onEditClick(ads)}
              >
                <SquarePen className="mr-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsCard;
