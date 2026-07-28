import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInitials } from "../../helpers/getInitials";
import { getOptionalImageUrl } from "../../helpers/getHelperUrl";
import styles from "./ChatContactAvatar.module.scss";

type ChatContactAvatarProps = {
  name: string;
  profilePhoto?: string;
  size?: "sm" | "md";
  /** When set, the avatar becomes a link to this profile path. */
  to?: string;
  ariaLabel?: string;
};


const ChatContactAvatar = ({
  name,
  profilePhoto,
  size = "md",
  to,
  ariaLabel,
}: ChatContactAvatarProps) => {
  const imageUrl = getOptionalImageUrl(profilePhoto);
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = size === "sm" ? styles.sm : styles.md;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const avatar =
    imageUrl && !imageFailed ? (
      <img
        src={imageUrl}
        alt=""
        className={`${styles.avatar} ${sizeClass}`}
        onError={() => setImageFailed(true)}
      />
    ) : (
      <span className={`${styles.fallback} ${sizeClass}`} aria-hidden="true">
        {getInitials(name)}
      </span>
    );

  if (!to) {
    return avatar;
  }

  return (
    <Link
      to={to}
      className={styles.avatarLink}
      aria-label={ariaLabel ?? name}
      onClick={(event) => event.stopPropagation()}
    >
      {avatar}
    </Link>
  );
};

export default ChatContactAvatar;
