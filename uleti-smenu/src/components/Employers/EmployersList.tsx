import { useEmployers } from "../../hooks/useEmployers";
import LoadingContext from "../../store/Loading-context";
import { useContext, useEffect, useState } from "react";
import styles from "./EmployersList.module.scss";
import { Employer } from "../../models/User.model";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { PatchClientFavorite } from "../../services/user-service";
import { AuthContext } from "../../store/Auth-context";
import { useTranslation } from "react-i18next";

const EmployersList = () => {
  const { t } = useTranslation();
  const { isLoading } = useContext(LoadingContext);
  const { authStatus, role } = useContext(AuthContext);
  const { employers: initialEmployers, error } = useEmployers();
  const [employers, setEmployers] = useState(initialEmployers);
  const canToggleFavourite = authStatus === "authenticated" && role === "Employee";
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free",
    slides: {
      perView: "auto", // ← key change!
      spacing: 50,
    },
    breakpoints: {
      "(max-width: 768px)": {
        slides: { perView: 1, spacing: 10 },
      },
      "(max-width: 1024px)": {
        slides: { perView: 2, spacing: 10 },
      },
    },
  });

  useEffect(() => {
    setEmployers(initialEmployers);
  }, [initialEmployers]);

  const handleChangeFavourite = async (
    employer: Employer,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    if (!canToggleFavourite) return;

    try {
      await PatchClientFavorite(employer.id);

      setEmployers((prev: Employer[]) =>
        prev.map((e: Employer) =>
          e.id === employer.id ? { ...e, isFavourite: !Boolean(e.isFavourite) } : e,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="text-center py-6">{t("common.loading")}</div>;
  if (error)
    return <div className="text-center py-6 text-red-600">{error}</div>;
  if (employers.length === 0)
    return <div className="text-center py-6">{t("employers.noEmployers")}</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.text}>
        <h2 className="text-[30px] font-bold">{t("employers.title")}</h2>
        <p className="font-medium text-gray">
          {t("employers.subtitle")}
        </p>
      </div>
      <div ref={sliderRef} className="keen-slider px-2 py-4">
        {employers.map((employer: Employer) => {
          return (
            <div
              className={`keen-slider__slide ${styles["employer-card"]}`}
              key={employer.id}
            >
              <img
                src={getImageUrl(employer.profilePhoto)}
                alt={employer.name}
                className={styles["employer-img"]}
              />
              {canToggleFavourite && (
                <button
                  type="button"
                  className={`${styles["favourite-btn"]} ${employer.isFavourite ? styles["is-favourite"] : ""}`}
                  aria-label={
                    employer.isFavourite
                              ? t("employers.removeFromFavorites")
                              : t("employers.addToFavorites")
                  }
                  onClick={(e) => handleChangeFavourite(employer, e)}
                >
                  {employer.isFavourite ? "★" : "☆"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployersList;
