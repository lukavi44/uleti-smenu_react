import { NavLink } from "react-router-dom";

import styles from './Footer.module.scss';
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../assets/logo.png";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width:768px)');
    const footerSections = [
        {
            title: t("footer.platform"),
            links: [t("footer.about"), t("footer.howItWorks"), t("footer.faq")]
        },
        {
            title: t("footer.forCandidates"),
            links: [t("footer.findShift"), t("footer.howToApply"), t("footer.profileTips")]
        },
        {
            title: t("footer.forRestaurants"),
            links: [t("footer.postAd"), t("footer.candidateOverview"), t("footer.subscriptions")]
        },
        {
            title: t("footer.legal"),
            links: [t("footer.terms"), t("footer.privacy"), t("footer.cookies")]
        },
        {
            title: t("footer.contact"),
            links: ["support@uletismenu.com", "+381 11 123 456", "Novi Sad, Srbija"]
        }
    ];
    return (
        <>
            {isMobile && (
                <footer className={`${styles['footer-container']} fixed bottom-0 left-0 w-full bg-blue-600 text-white text-center py-3 md:hidden flex justify-between p-5 gap-x-3`}>
                    <NavLink to="/">{t("header.posts")}</NavLink>
                    <NavLink to="/">{t("footer.candidates")}</NavLink>
                    <NavLink to="/">{t("footer.employers")}</NavLink>
                    <NavLink to="/">{t("header.profile")}</NavLink>
                </footer>
            )}
            {!isMobile && (
                <>
                <section className={styles.info}>
                    <div className={styles.top}>
                        <p>
                            {t("footer.intro")}
                        </p>
                    </div>
                    <div className={styles.bottom}>
                        {footerSections.map((section) => (
                            <div key={section.title} className={styles["footer-column"]}>
                                <p className={styles["column-title"]}>{section.title}</p>
                                <ul>
                                    {section.links.map((linkText) => (
                                        <li key={linkText}>{linkText}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </section>
                <footer className={styles["footer-desktop"]}>
                    <div className={styles.left}>
                        <img src={logo} alt="logo" width={250} />
                    </div>
                    <div className={styles.right}>
                        © {new Date().getFullYear()} UletiSmenu. {t("footer.rights")}
                    </div>
                </footer>
                </>
            )}
        </>
    )
}

export default Footer;