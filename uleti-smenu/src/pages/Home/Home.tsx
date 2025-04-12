import { useMediaQuery } from '@mui/material';
import coverImg from '../../assets/cover_img.jpg';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import JobPosts from '../JobPosts/JobPosts';
import styles from './Home.module.scss';
import EmployersList from '../../components/Employers/EmployersList';

const HomePage = () => {
    const isMobile = useMediaQuery('(max-width:768px)');
    return (
        <>
            <Header />
            <section className={styles.hero}>
            {!isMobile && (
                <div className={styles.content}>
                    <div className={styles.left}>
                        <p>Uleti smenu!</p>
                        <p className={styles["p-medium"]}>uzmi lovu, kad kolega ne moze.</p>
                    </div>
                    <div className={styles.right}></div>
                </div>
            )}
            {isMobile && (
                <div className={styles["background-container"]}>
                    <div className={styles.content}>
                        <div className={styles.left}>
                            <p>Uleti smenu!</p>
                            <p className={styles["p-medium"]}>uzmi lovu, kad kolega ne moze.</p>
                        </div>
                        <div className={styles.right}/>
                    </div>
                </div>
            )}
            </section>
            {!isMobile && (
                <section className={styles.employers}>
                    <div>
                        <EmployersList/>
                    </div>
                </section>
            )}
            {isMobile && <JobPosts />}
            <Footer />
        </>
    )
}

export default HomePage;