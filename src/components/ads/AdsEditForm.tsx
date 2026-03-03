import type { AdsItem } from "@/types";
import type { UseFormReturn } from "react-hook-form";
import type { AdsFormFillable } from "./AdsForm";
import AdsForm from "./AdsForm";
import AdsImage from "./AdsImage";
import AdsImageUploader from "./AdsImageUploader";

interface AdsEditFormProps {
  formId: string;
  ads: AdsItem;
  imageRefreshKey: number;
  onSubmit: (data: AdsFormFillable) => Promise<void>;
  onFormChange?: (form: UseFormReturn<AdsFormFillable>) => void;
  onImageUploadSuccess: () => void;
}

const AdsEditForm = ({
  formId,
  ads,
  imageRefreshKey,
  onSubmit,
  onFormChange,
  onImageUploadSuccess,
}: AdsEditFormProps) => {
  return (
    <div className="grid flex-1 auto-rows-min gap-6">
      {/* Image Section */}
      <div className="flex w-full flex-col gap-4 px-4 md:flex-row md:items-center">
        <AdsImage ads_uuid={ads.uuid} refreshKey={imageRefreshKey} />
        <div>
          <div className="text-muted-foreground mb-2 text-sm font-normal">
            <p>
              Upload a new image or <br /> replace the existing one. (max 5MB)
            </p>
          </div>
          <AdsImageUploader
            ads_uuid={ads.uuid}
            onUploadSuccess={onImageUploadSuccess}
            className="flex-1"
          />
        </div>
      </div>

      {/* Form Section */}
      <AdsForm
        mode="edit"
        formId={formId}
        initialData={ads}
        onSubmit={onSubmit}
        onFormChange={onFormChange}
      />
    </div>
  );
};

export default AdsEditForm;
