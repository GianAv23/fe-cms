import { useNavigate, type Path } from "@/router";
import type { NewsItem } from "@/types";
import DOMPurify from "isomorphic-dompurify";
import { SquarePen, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import NewsImage from "./NewsImage";

interface NewsCardProps {
  news: NewsItem;
  imageRefreshKey: number;
  onEditClick: (news: NewsItem) => void;
  onDeleteClick: (news: NewsItem) => void;
}

// Helper function to format category names
const formatCategoryName = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const NewsCard = ({
  news,
  imageRefreshKey,
  onEditClick,
  onDeleteClick,
}: NewsCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-3 flex flex-col md:flex-row">
      <div className="bg-muted flex h-full w-full flex-col gap-4 rounded-xl p-2 md:flex-row">
        {/* Image */}
        <NewsImage
          news_uuid={news.uuid}
          refreshKey={imageRefreshKey}
          className="h-[180px] w-full object-top-right md:h-32 md:w-32"
          onClick={() => {
            navigate(`/dashboard/news/${news.uuid}` as Path);
          }}
        />

        {/* Content */}
        <div className="flex min-h-full w-full flex-col items-start justify-between gap-2 md:flex-row">
          <div
            className="flex h-full w-full flex-col gap-2"
            onClick={() => {
              navigate(`/dashboard/news/${news.uuid}` as Path);
            }}
          >
            <div className="flex w-full items-center gap-2">
              <Badge variant={news.published ? "default" : "outline"}>
                {news.published ? "Published" : "Draft"}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {formatCategoryName(news.category)}
              </span>
            </div>
            <div className="w-full flex-1">
              <p className="md:text-md hover:text-primary line-clamp-2 cursor-pointer text-sm font-medium transition-colors duration-200 ease-in-out md:line-clamp-1">
                {news.title}
              </p>
              <div className="hidden md:block">
                <div
                  className="text-muted-foreground line-clamp-2 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(news.content, {
                      ALLOWED_TAGS: ["p"],
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-row gap-2 md:justify-end">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 md:w-34 md:flex-none"
              onClick={() => onDeleteClick(news)}
            >
              <Trash2 />
              <p className="hidden md:block">Delete</p>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 md:w-34 md:flex-none"
              onClick={() => onEditClick(news)}
            >
              <SquarePen />
              <p className="hidden md:block">Edit</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
