import { InputHTMLAttributes, ReactNode, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import styles from "./AuthTextField.module.scss";

type AuthTextFieldProps = {
  label: string;
  error?: string;
  warning?: string;
  reserveMessageSpace?: boolean;
  leadingIcon?: ReactNode;
  showPasswordToggle?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const AuthTextField = ({
  label,
  error,
  warning,
  reserveMessageSpace = false,
  leadingIcon,
  showPasswordToggle = false,
  type = "text",
  className,
  ...inputProps
}: AuthTextFieldProps) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password" || showPasswordToggle;
  const inputType = isPassword && showPasswordToggle ? (visible ? "text" : "password") : type;
  const message = error ?? warning;
  const showMessageSlot = Boolean(message) || reserveMessageSpace;

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputWrap}>
        {leadingIcon ? <span className={styles.leadingIcon}>{leadingIcon}</span> : null}
        <input
          {...inputProps}
          type={inputType}
          className={`${styles.input} ${leadingIcon ? styles.inputWithIcon : ""} ${
            isPassword && showPasswordToggle ? styles.inputWithToggle : ""
          } ${error ? styles.inputError : ""} ${className ?? ""}`}
        />
        {isPassword && showPasswordToggle ? (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setVisible((value) => !value)}
            aria-label={label}
          >
            {visible ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>
      {showMessageSlot ? (
        <span
          className={`${styles.messageSlot} ${error ? styles.error : warning ? styles.warning : ""}`}
          role={warning && !error ? "status" : undefined}
          aria-live={warning && !error ? "polite" : undefined}
        >
          {message ?? "\u00a0"}
        </span>
      ) : null}
    </label>
  );
};

export default AuthTextField;
