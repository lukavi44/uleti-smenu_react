import { NavLink } from "react-router-dom";
import Layout from "./Layout";
import styles from './RegistrationDialog.module.scss';
import logo from '../../assets/logo.png';
import { useTranslation } from "react-i18next";

const RegistrationDialog = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();
    return (
        <Layout onClose={() => onClose()}>
            <div className={styles.wrapper}>
                <div className={styles.top}>
                    <img src={logo} alt="logo" width={300} />
                </div>
                <div className={styles.bottom}>
                    <div className={styles.faq}>
                        <p className="text-xl font-bold">{t("dialogs.chooseAccountType")}</p>
                        <p className="text-sm text-gray-600 font-semibold">{t("dialogs.needMoreInfo")}</p>
                        <NavLink to="">
                            <p className="text-sm text-blue-600 hover:text-blue-800 transition font-semibold">{t("footer.faq")}</p>
                        </NavLink>
                    </div>
                    <div className={styles.options}>
                        <NavLink to="/registration-user" onClick={onClose}>
                            <p>{t("dialogs.registerCandidate")}</p>
                        </NavLink>
                        <NavLink to="/registration" onClick={onClose}>
                            <p>{t("dialogs.registerEmployer")}</p>
                        </NavLink>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default RegistrationDialog;