import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import styles from "./ProfileAccordion.module.scss";

interface ProfileAccordionProps {
  title: string;
  icon: ReactNode;
  itemCount?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

const ProfileAccordion = ({
  title,
  icon,
  itemCount,
  isOpen,
  onOpenChange,
  children,
}: ProfileAccordionProps) => (
  <section className={styles.section}>
    <button
      type="button"
      className={styles.header}
      onClick={() => onOpenChange(!isOpen)}
      aria-expanded={isOpen}
    >
      <span className={styles.headerMain}>
        <span className={styles.iconWrap} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.title}>{title}</span>
        {itemCount !== undefined && <span className={styles.countBadge}>{itemCount}</span>}
      </span>
      <ChevronDownIcon
        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        aria-hidden="true"
      />
    </button>
    {isOpen ? <div className={styles.content}>{children}</div> : null}
  </section>
);

export default ProfileAccordion;
