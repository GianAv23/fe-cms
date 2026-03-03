import NewsForm, { type NewsFormFillable } from "@/components/news/NewsForm";
import NewsImage from "@/components/news/NewsImage";
import ImageUploader from "@/components/news/NewsImageUploader";
import type { NewsItem } from "@/types";
import type { UseFormReturn } from "react-hook-form";

interface NewsEditFormProps {
  formId: string;
  news: NewsItem;
  imageRefreshKey: number;
  onSubmit: (data: NewsFormFillable) => Promise<void>;
  onFormChange?: (form: UseFormReturn<NewsFormFillable>) => void;
  onImageUploadSuccess: () => void;
}

const NewsEditForm = ({
  formId,
  news,
  imageRefreshKey,
  onSubmit,
  onFormChange,
  onImageUploadSuccess,
}: NewsEditFormProps) => {
  return (
    <div className="grid flex-1 auto-rows-min gap-6">
      {/* Image Section */}
      <div className="flex w-full flex-col gap-4 px-4 md:flex-row md:items-center">
        <NewsImage news_uuid={news.uuid} refreshKey={imageRefreshKey} />
        <div>
          <div className="text-muted-foreground mb-2 text-sm font-normal">
            <p>
              Upload a new image or <br /> replace the existing one. (max 5MB)
            </p>
          </div>
          <ImageUploader
            news_uuid={news.uuid}
            onUploadSuccess={onImageUploadSuccess}
            className="flex-1"
          />
        </div>
      </div>

      {/* Form Section */}
      <NewsForm
        mode="edit"
        formId={formId}
        initialData={news}
        onSubmit={onSubmit}
        onFormChange={onFormChange}
      />
    </div>
  );
};

export default NewsEditForm;
