import { useEffect, useState } from "react";
import { getOptionalImageUrl } from "../../helpers/getHelperUrl";
import styles from "./ChatContactAvatar.module.scss";

type ChatContactAvatarProps = {
  name: string;
  profilePhoto?: string;
  size?: "sm" | "md";
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

const ChatContactAvatar = ({ name, profilePhoto, size = "md" }: ChatContactAvatarProps) => {
  const imageUrl = getOptionalImageUrl(profilePhoto);
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = size === "sm" ? styles.sm : styles.md;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`${styles.avatar} ${sizeClass}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className={`${styles.fallback} ${sizeClass}`} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
};

export default ChatContactAvatar;
