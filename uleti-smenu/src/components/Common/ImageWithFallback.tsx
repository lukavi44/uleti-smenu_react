import { useEffect, useState } from "react";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { getOptionalImageUrl } from "../../helpers/getHelperUrl";
import styles from "./ImageWithFallback.module.scss";

type ImageWithFallbackProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

const ImageWithFallback = ({
  src,
  alt = "",
  className,
  fallbackClassName,
}: ImageWithFallbackProps) => {
  const imageUrl = getOptionalImageUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${styles.fallback} ${fallbackClassName ?? ""}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt}
    >
      <BuildingStorefrontIcon className={styles.fallbackIcon} aria-hidden />
    </div>
  );
};

export default ImageWithFallback;
