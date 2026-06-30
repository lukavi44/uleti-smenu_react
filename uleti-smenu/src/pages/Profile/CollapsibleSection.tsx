import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ReactNode, useState } from "react";
import styles from "./CollapsibleSection.module.scss";

interface CollapsibleSectionProps {
    title: string;
    titleTag?: "h2" | "h3";
    defaultOpen?: boolean;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    itemCount?: number;
    children: ReactNode;
    headerAside?: ReactNode;
}

const CollapsibleSection = ({
    title,
    titleTag = "h2",
    defaultOpen = true,
    isOpen: controlledIsOpen,
    onOpenChange,
    itemCount,
    children,
    headerAside
}: CollapsibleSectionProps) => {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    const TitleTag = titleTag;

    const handleToggle = () => {
        const nextOpen = !isOpen;
        if (!isControlled) {
            setInternalIsOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.toggle}
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                >
                    <ChevronDownIcon
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                        aria-hidden="true"
                    />
                    <TitleTag className={styles.title}>{title}</TitleTag>
                    {itemCount !== undefined && (
                        <span className={styles.countBadge} aria-label={`${itemCount}`}>
                            {itemCount}
                        </span>
                    )}
                </button>
                {headerAside}
            </div>
            {isOpen && <div className={styles.content}>{children}</div>}
        </section>
    );
};

export default CollapsibleSection;
