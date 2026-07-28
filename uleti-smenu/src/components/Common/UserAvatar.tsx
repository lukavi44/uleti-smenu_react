import { useEffect, useState } from "react";
import { getInitials } from "../../helpers/getInitials";
import { getOptionalImageUrl } from "../../helpers/getHelperUrl";
import styles from "./UserAvatar.module.scss";

type UserAvatarProps = {
  name: string;
  profilePhoto?: string | null;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
};

const UserAvatar = ({
  name,
  profilePhoto,
  className = "",
  fallbackClassName = "",
  alt = "",
}: UserAvatarProps) => {
  const imageUrl = getOptionalImageUrl(profilePhoto);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={alt || name}
        className={`${styles.avatar} ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${styles.fallback} ${className} ${fallbackClassName}`}
      role={alt || name ? "img" : undefined}
      aria-label={alt || name || undefined}
      aria-hidden={!alt && !name}
    >
      {getInitials(name)}
    </span>
  );
};

export default UserAvatar;
