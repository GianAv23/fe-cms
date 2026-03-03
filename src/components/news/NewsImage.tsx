import useApi from "@/hooks/use-api";
import { Loader2, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";

interface NewsImageProps {
  news_uuid: string;
  className?: string;
  refreshKey?: number;
  onClick?: () => void;
}

const NewsImage: React.FC<NewsImageProps> = ({
  news_uuid,
  className,
  refreshKey,
  onClick = () => {},
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const api = useApi();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const response = await api.get(`/news-image/${news_uuid}`);

        if (response.data.response.data) {
          setImageUrl(response.data.response.data);
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (news_uuid) {
      fetchImage();
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [news_uuid, api, refreshKey]);

  if (isLoading) {
    return (
      <div
        className={`bg-muted flex h-32 min-w-64 items-center justify-center rounded-md object-cover ${className}`}
      >
        <Loader2 className="text-primary h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div
        className={`flex h-32 min-w-64 items-center justify-center rounded-md bg-white object-cover ${className}`}
      >
        <Newspaper className="text-primary-news/50 size-10" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="News"
      className={`h-full min-w-64 rounded-md object-cover md:h-36 ${className}`}
      onError={() => {
        setError(true);
      }}
      onClick={onClick}
    />
  );
};

export default NewsImage;
