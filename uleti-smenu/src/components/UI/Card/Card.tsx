import React from "react";
import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  img: string;
  description: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  imageOverlay?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  img,
  description,
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
        <img
          src={img}
          alt={title}
          className={isHorizontal ? styles.imageHorizontal : styles.imageVertical}
        />
        {imageOverlay ? <div className={styles.mediaOverlay}>{imageOverlay}</div> : null}
      </div>
      <div className={styles.content}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
