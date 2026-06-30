import React from "react";
import ImageWithFallback from "../../Common/ImageWithFallback";
import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  img?: string | null;
  description: string;
  meta?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  imageOverlay?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  img,
  description,
  meta,
  orientation = "vertical",
  className = "",
  imageOverlay,
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={`${styles.card} ${isHorizontal ? styles.horizontal : styles.vertical} ${className}`}
    >
      <div className={styles.media}>
        <ImageWithFallback
          src={img}
          alt={title}
          className={isHorizontal ? styles.imageHorizontal : styles.imageVertical}
          fallbackClassName={isHorizontal ? styles.imageHorizontal : styles.imageVertical}
        />
        {imageOverlay ? <div className={styles.mediaOverlay}>{imageOverlay}</div> : null}
      </div>
      <div className={styles.content}>
        <h2>{title}</h2>
        {meta ? <p className={styles.meta}>{meta}</p> : null}
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
