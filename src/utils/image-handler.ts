export const compressImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const outputFormat =
          file.type === "image/png" ? "image/png" : "image/jpeg";
        const quality = outputFormat === "image/png" ? 1 : 0.85;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputFormat,
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Image load error"));
      };
    };

    reader.onerror = () => {
      reject(new Error("File read error"));
    };

    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

export const createImageDropHandler = <T extends { image: File }>(
  setFiles: (files: File[]) => void,
  setPreview: (preview: string | ArrayBuffer | null) => void,
  setImageDimensions: (
    dimensions: { width: number; height: number } | null,
  ) => void,
  setIsRecommendedResolution: (isRecommended: boolean) => void,
  form: {
    setValue: (name: keyof T, value: T[keyof T]) => void;
    clearErrors: (name?: keyof T) => void;
    resetField: (name: keyof T) => void;
  },
) => {
  return (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    const reader = new FileReader();
    try {
      reader.onload = () => {
        setPreview(reader.result);

        const img = new window.Image();
        img.onload = () => {
          setImageDimensions({
            width: img.width,
            height: img.height,
          });

          const isRecommended = img.width === 1920 && img.height === 1080;
          setIsRecommendedResolution(isRecommended);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(acceptedFiles[0]);
      form.setValue("image" as keyof T, acceptedFiles[0] as T[keyof T]);
      form.clearErrors("image" as keyof T);
    } catch (error) {
      setPreview(null);
      form.resetField("image" as keyof T);
    }
  };
};

export const getUploadStatusText = (uploadProgress: number) => {
  if (uploadProgress === 0) return "Preparing upload...";
  if (uploadProgress < 30) return "Starting upload...";
  if (uploadProgress < 70) return "Uploading image...";
  if (uploadProgress < 95) return "Almost done...";
  return "Finalizing...";
};
