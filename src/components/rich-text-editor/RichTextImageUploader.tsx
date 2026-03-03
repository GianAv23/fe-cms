import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useApi, {
  useErrorToastHandler,
  type ResponseModel,
} from "@/hooks/use-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tiptap/react";
import { ImagePlus, Loader2 } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  compressImage,
  formatFileSize,
  createImageDropHandler,
  getUploadStatusText,
} from "@/utils/image-handler";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface ImageUploaderProps {
  news_uuid?: string;
  onUploadSuccess?: () => void;
  className?: string;
  buttonLabel?: string;
  editor: Editor | null;
}

type ImageDimensions = {
  width: number;
  height: number;
};

const imageSchema = z.object({
  image: z.instanceof(File).refine((file) => file.size !== 0, {
    message: "Please select an image",
  }),
});

export type ImageUploaderForm = z.infer<typeof imageSchema>;

const RichTextImageUploader: React.FC<ImageUploaderProps> = ({
  news_uuid,
  onUploadSuccess,
  className,
  buttonLabel = "Add Image",
  editor,
}) => {
  const api = useApi();
  const errorHandler = useErrorToastHandler();
  const [preview, setPreview] = useState<string | ArrayBuffer | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imageDimensions, setImageDimensions] =
    useState<ImageDimensions | null>(null);
  const [isRecommendedResolution, setIsRecommendedResolution] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [shouldCompress, setShouldCompress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>("");

  const form = useForm<ImageUploaderForm>({
    resolver: zodResolver(imageSchema),
    mode: "onChange",
    defaultValues: {
      image: new File([""], "filename"),
    },
  });

  // Function to handle file drop (React Dropzone)
  const onDrop = useCallback(
    createImageDropHandler(
      setFiles,
      setPreview,
      setImageDimensions,
      setIsRecommendedResolution,
      form,
    ),
    [form],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024, // 5MB
    });

  const handleDialogClose = () => {
    setPreview(null);
    setImageDimensions(null);
    setIsRecommendedResolution(true);
    setFiles([]);
    setUploadProgress(0);
    setUploadStage("");
    form.reset();
  };

  if (!editor) {
    return null;
  }

  const handleSubmit = async (data: ImageUploaderForm) => {
    if (!news_uuid || !editor) {
      toast.error("News UUID is required for uploading image.");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    const formData = new FormData();

    try {
      // Apply compression if enabled
      let imageToUpload = data.image;

      if (
        shouldCompress &&
        imageDimensions &&
        (imageDimensions.width > 854 || imageDimensions.height > 480)
      ) {
        try {
          setUploadStage("Compressing image...");
          imageToUpload = await compressImage(data.image, 854, 480);
        } catch (compressionError) {
          console.error("Image compression failed:", compressionError);
        }
      }

      formData.append("image", imageToUpload);
      setUploadStage("Uploading...");

      const response = await api.post<
        ResponseModel<{
          uuid: string;
          news_uuid: string;
          order: number;
          fileType: string;
          link: string;
          updatedAt: string;
        }>
      >(`/news-image/gallery/${news_uuid}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100),
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast.success(
        `Image ${shouldCompress ? "compressed and " : ""}uploaded successfully!`,
        { description: response.data.response.message },
      );

      const imageUrl = `${api.defaults.baseURL}/news-image/show-gallery/${response.data.response.data.link}`;

      if (editor && !editor.isDestroyed) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }

      setDialogOpen(false);
      handleDialogClose();

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      errorHandler(error as any);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      setUploadStage("");
    }
  };

  return (
    <>
      <div className={className}>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open && !isLoading) {
              handleDialogClose();
            }
            setDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="flex w-full flex-1"
            >
              <ImagePlus className="mr-1" />
              {buttonLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="p-4 md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
              <DialogDescription>
                Upload an image to insert into the editor.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.stopPropagation(); // Prevent event from bubbling to parent form
                  form.handleSubmit(handleSubmit)(e);
                }}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormControl className="flex flex-col items-center gap-4 md:flex-row">
                        <div
                          {...getRootProps({
                            className: `border-2 border-dashed rounded-lg p-6 text-center justify-center flex-1 max-h-[200px] ${
                              isDragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-white"
                            }`,
                          })}
                        >
                          {preview && (
                            <img
                              src={preview as string}
                              alt="Uploaded Image"
                              className="max-h-[100px] rounded-lg"
                            />
                          )}

                          <ImagePlus
                            className={`stroke-muted-foreground size-8 stroke-[1.25px] ${preview ? "hidden" : "block"}`}
                          />
                          <Input
                            type="file"
                            {...getInputProps()}
                            className="hidden"
                          />
                          {isDragActive ? (
                            <p className="text-muted-foreground text-sm">
                              Drop the image here...
                            </p>
                          ) : (
                            <>
                              <p className="text-muted-foreground text-sm">
                                Drag & drop an image here, or click to select
                                one
                              </p>
                            </>
                          )}
                        </div>
                      </FormControl>

                      {/* Image Resolution Display */}
                      {imageDimensions && (
                        <div
                          className={`mt-2 rounded-sm p-2 ${isRecommendedResolution ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                        >
                          <div className="flex items-center">
                            {isRecommendedResolution ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2 h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2 h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <div className="text-xs md:text-sm">
                              <p className="font-medium">
                                Image Resolution: {imageDimensions.width} x{" "}
                                {imageDimensions.height}
                              </p>
                              {!isRecommendedResolution && (
                                <p className="mt-1 text-xs">
                                  Recommended resolution is 1920x1080 for
                                  optimal display in mobile devices.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Showing File Name and Size */}
                      {files.length > 0 && (
                        <div className="bg-muted mt-2 rounded-sm p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <ImagePlus className="text-muted-foreground h-4 w-4" />
                              <p className="w-24 truncate text-xs font-medium md:text-sm">
                                {files[0].name}
                              </p>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {formatFileSize(files[0].size)}
                            </span>
                          </div>
                        </div>
                      )}
                      <FormMessage>
                        {fileRejections.length !== 0 && (
                          <span>
                            Image must be a valid image file and less than 5MB
                            and png, jpg, jpeg form.
                          </span>
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                {/* Compression toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression-toggle"
                    checked={shouldCompress}
                    onCheckedChange={setShouldCompress}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="compression-toggle" className="text-xs">
                    Compress to 854x480 for better load performance in mobile
                  </Label>
                </div>

                {/* Upload Progress Indicator */}
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{uploadStage}</span>
                      <span className="text-sm font-semibold">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {getUploadStatusText(uploadProgress)}
                    </p>
                  </div>
                )}

                <DialogFooter className="flex gap-2 sm:justify-end">
                  <DialogClose asChild ref={closeRef}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => {
                        if (!isLoading) {
                          setDialogOpen(false);
                          handleDialogClose();
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading || !files.length}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload & Insert"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default RichTextImageUploader;
