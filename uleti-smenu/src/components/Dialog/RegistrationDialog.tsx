import { NavLink } from "react-router-dom";
import Layout from "./Layout";
import styles from './RegistrationDialog.module.scss';
import logo from '../../assets/logo.png';

const RegistrationDialog = ({ onClose }: { onClose: React.MouseEventHandler }) => {

    return (
        <Layout onClose={onClose}>
            <div className={styles.wrapper}>
                <div className={styles.top}>
                    <img src={logo} alt="logo" width={300} />
                </div>
                <div className={styles.bottom}>
                    <div className={styles.faq}>
                        <p className="text-xl font-bold">Izaberite vrstu naloga</p>
                        <p className="text-sm text-gray-600 font-semibold">Ukoliko imate nedoumice i potrebno vam je vise informacija, sledite naredni link:</p>
                        <NavLink to="">
                            <p className="text-sm text-blue-600 hover:text-blue-800 transition font-semibold">Cesto postavljena pitanja (FAQ)</p>
                        </NavLink>
                    </div>
                    <div className={styles.options}>
                        <NavLink to="/registration-user">
                            <p>Registruj se kao kandidat</p>
                        </NavLink>
                        <NavLink to="/registration">
                            <p>Registruj se kao poslodavac</p>
                        </NavLink>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RegistrationDialog;