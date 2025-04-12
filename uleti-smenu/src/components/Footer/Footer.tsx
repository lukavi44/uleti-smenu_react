import { NavLink } from "react-router-dom";

import styles from './Footer.module.scss';

const Footer = () => {
    return (
    <footer className={`${styles['footer-container']} fixed bottom-0 left-0 w-full bg-blue-600 text-white text-center py-3 md:hidden flex justify-between p-5 gap-x-3`}>
        <NavLink to="/">Oglasi</NavLink>
        <NavLink to="/">Kandidati</NavLink>
        <NavLink to="/">Poslodavci</NavLink>
        <NavLink to="/">Profil</NavLink>
    </footer>
    )
}

export default Footer;