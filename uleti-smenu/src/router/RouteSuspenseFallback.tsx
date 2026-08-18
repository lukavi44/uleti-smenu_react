import styles from "../utils/loader.module.scss";

const RouteSuspenseFallback = () => (
  <div className={styles.loaderContainer}>
    <div className={styles.loader} aria-hidden="true" />
  </div>
);

export default RouteSuspenseFallback;
