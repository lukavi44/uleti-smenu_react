import { ReactNode, useState } from "react";
import styles from "./CollapsibleSection.module.scss";

interface CollapsibleSectionProps {
    title: string;
    titleTag?: "h2" | "h3";
    defaultOpen?: boolean;
    children: ReactNode;
    headerAside?: ReactNode;
}

const CollapsibleSection = ({
    title,
    titleTag = "h2",
    defaultOpen = true,
    children,
    headerAside
}: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const TitleTag = titleTag;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setIsOpen((previous) => !previous)}
                    aria-expanded={isOpen}
                >
                    <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`} aria-hidden="true">
                        ›
                    </span>
                    <TitleTag className={styles.title}>{title}</TitleTag>
                </button>
                {headerAside}
            </div>
            {isOpen && <div className={styles.content}>{children}</div>}
        </section>
    );
};

export default CollapsibleSection;
