import { useMediaQuery } from "@mui/material";
import { useContext } from "react";
import Footer from "../../components/Footer/Footer";
import JobPosts from "../JobPosts/JobPosts";
import styles from "./Home.module.scss";
import EmployersList from "../../components/Employers/EmployersList";
import { AuthContext } from "../../store/Auth-context";

const HomePage = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const { authStatus, role } = useContext(AuthContext);
  const canSeeEmployersCarousel =
    authStatus === "authenticated" && role === "Employee";

  return (
    <>
      <section className={styles.hero}>
        {!isMobile && (
          <div className={styles.content}>
            <div className={styles.left}>
              <p>Uleti smenu!</p>
              <p className={styles["p-medium"]}>
                uzmi lovu, kad kolega ne moze.
              </p>
            </div>
            <div className={styles.right}></div>
          </div>
        )}
        {isMobile && (
          <div className={styles["background-container"]}>
            <div className={styles.content}>
              <div className={styles.left}>
                <p>Uleti smenu!</p>
                <p className={styles["p-medium"]}>
                  uzmi lovu, kad kolega ne moze.
                </p>
              </div>
              <div className={styles.right} />
            </div>
          </div>
        )}
      </section>
      {!isMobile && canSeeEmployersCarousel && (
        <section className={styles.employers}>
          <EmployersList />
        </section>
      )}
      {isMobile && <JobPosts />}
      <Footer />
    </>
  );
};

export default HomePage;
