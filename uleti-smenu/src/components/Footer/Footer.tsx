import { NavLink } from "react-router-dom";

import styles from './Footer.module.scss';
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../assets/logo.png";

const footerSections = [
    {
        title: "Platform",
        links: ["O nama", "Kako funkcioniše", "FAQ"]
    },
    {
        title: "Za kandidate",
        links: ["Pronađi smenu", "Kako aplicirati", "Saveti za profil"]
    },
    {
        title: "Za restorane",
        links: ["Objavi oglas", "Pregled kandidata", "Pretplate i cene"]
    },
    {
        title: "Pravno",
        links: ["Uslovi korišćenja", "Politika privatnosti", "Politika kolačića"]
    },
    {
        title: "Kontakt",
        links: ["support@uletismenu.com", "+381 11 123 456", "Novi Sad, Srbija"]
    }
];

const Footer = () => {
    const isMobile = useMediaQuery('(max-width:768px)');
    return (
        <>
            {isMobile && (
                <footer className={`${styles['footer-container']} fixed bottom-0 left-0 w-full bg-blue-600 text-white text-center py-3 md:hidden flex justify-between p-5 gap-x-3`}>
                    <NavLink to="/">Oglasi</NavLink>
                    <NavLink to="/">Kandidati</NavLink>
                    <NavLink to="/">Poslodavci</NavLink>
                    <NavLink to="/">Profil</NavLink>
                </footer>
            )}
            {!isMobile && (
                <>
                <section className={styles.info}>
                    <div className={styles.top}>
                        <p>
                            UletiSmenu povezuje restorane kojima hitno treba podrška sa kandidatima
                            koji žele fleksibilne dnevne angažmane.
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
                        © {new Date().getFullYear()} UletiSmenu. Sva prava zadržana.
                    </div>
                </footer>
                </>
            )}
        </>
    )
}

export default Footer;