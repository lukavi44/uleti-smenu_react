import styles from "./StarRatingInput.module.scss";

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  name: string;
}

const StarRatingInput = ({ value, onChange, name }: StarRatingInputProps) => {
  return (
    <div className={styles.starRow} role="radiogroup" aria-label={name}>
      {RATING_OPTIONS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          className={`${styles.starButton} ${value >= star ? styles.starSelected : ""}`}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRatingInput;
