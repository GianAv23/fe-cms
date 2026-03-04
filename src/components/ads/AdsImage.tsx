import useApi from "@/hooks/use-api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import adsIcon from "/animation/ads-white.svg";

interface AdsImageProps {
  ads_uuid: string;
  className?: string;
  refreshKey?: number;
  onClick?: () => void;
}

const AdsImage: React.FC<AdsImageProps> = ({
  ads_uuid,
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
        const response = await api.get(`/ads-image/${ads_uuid}`);

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

    if (ads_uuid) {
      fetchImage();
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [ads_uuid, api, refreshKey]);

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
        {" "}
        <img src={adsIcon} alt="Ads Icon" className="size-28" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Ads"
      className={`h-full min-w-64 rounded-md object-cover md:h-36 ${className}`}
      onError={() => {
        setError(true);
      }}
      onClick={onClick}
    />
  );
};

export default AdsImage;
