import styles from "./Header.module.scss";
import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";

import "tailwindcss";

import logo from '../../assets/logo.png';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { AuthContext } from "../../store/Auth-context";
import RegistrationDialog from "../Dialog/RegistrationDialog";
import ConfirmationDialog from "../Dialog/ConfirmationDialog";

// import ProfileDialog from "../Dialogs/ProfileDialog";
// import { AuthContext } from "../../store/Auth-context";
// import ConfirmationDialog from "../Dialog/ConfirmationDialog";

const Header = () => {
    const [isRegisterModalOpened, setIsRegisterModalOpened] = useState(false);
    const [isLogoutModalOpened, setIsLogoutModalOpened] = useState(false);
    const { isLoggedIn, logout } = useContext(AuthContext);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);

    const [city, setCity] = useState('');

    const handleChange = (event: any) => {
        setCity(event.target.value as string);
    };

    return (
        <>
            <header className={styles["header-container"]}>
                <div className={styles.left}>
                    <NavLink to="">
                        <img src={logo} alt="" />
                    </NavLink>
                </div>
                <div className={styles.right}>
                    <div className={styles.mobile}>
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
                                    {selectedCity || "Grad"}
                                    <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                                </MenuButton>
                            </div>

                            <MenuItems
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-none"
                            >
                                <div className="py-1">
                                    {["Novi Sad", "Beograd", "Kragujevac"].map((city) => (
                                        <MenuItem key={city}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setSelectedCity(city)}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                                        }`}
                                                >
                                                    {city}
                                                </button>
                                            )}
                                        </MenuItem>
                                    ))}
                                </div>
                            </MenuItems>
                        </Menu>
                    </div>
                    <div className={`${styles.desktop}`}>
                        <NavLink to={"/jobPosts"}>
                            <p>Oglasi</p>
                        </NavLink>
                        <NavLink to={"/restaurants"}>
                            <p>Restorani</p>
                        </NavLink>
                        {isLoggedIn && (
                            <>
                                <NavLink to={"/profile"}>
                                    <p>Profil</p>
                                </NavLink>
                                <button onClick={() => setIsLogoutModalOpened(!isLogoutModalOpened)}>Odjava</button>
                            </>
                        )}
                        {!isLoggedIn && (
                            <>
                                <p onClick={() => setIsRegisterModalOpened(!isRegisterModalOpened)}>Registruj se</p>
                                <NavLink to={"/login"}>
                                    <p>Prijavi se</p>
                                </NavLink>
                            </>
                        )}
                        {isRegisterModalOpened && (
                            <RegistrationDialog onClose={() => setIsRegisterModalOpened(false)} />
                        )}
                        {isLogoutModalOpened && (
                            <ConfirmationDialog onConfirm={logout} onClose={() => setIsLogoutModalOpened(false)}/>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
