import { useEmployers } from "../../hooks/useEmployers";
import LoadingContext from "../../store/Loading-context";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./EmployersList.module.scss";
import { Employer } from "../../models/User.model";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { GetEmployerCities, PatchClientFavorite } from "../../services/user-service";
import { GetEmployerReviewSummary } from "../../services/review-service";
import { AuthContext } from "../../store/Auth-context";
import { useTranslation } from "react-i18next";
import RatingBadge from "../Reviews/RatingBadge";
import { ReviewSummary } from "../../models/Review.model";

const EmployersList = () => {
  const { t } = useTranslation();
  const { isLoading } = useContext(LoadingContext);
  const { authStatus, role } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const { employers: initialEmployers, error } = useEmployers(selectedCity || undefined);
  const [employers, setEmployers] = useState(initialEmployers);
  const [reviewSummaries, setReviewSummaries] = useState<Record<string, ReviewSummary>>({});
  const canToggleFavourite = authStatus === "authenticated" && role === "Employee";
  const canViewProfile = authStatus === "authenticated" && role === "Employee";
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free",
    slides: {
      perView: "auto",
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
    const loadCities = async () => {
      try {
        const response = await GetEmployerCities();
        setCities(response.data);
      } catch {
        setCities([]);
      }
    };

    void loadCities();
  }, []);

  useEffect(() => {
    setEmployers(initialEmployers);
  }, [initialEmployers]);

  useEffect(() => {
    const loadSummaries = async () => {
      if (authStatus !== "authenticated" || initialEmployers.length === 0) {
        setReviewSummaries({});
        return;
      }

      const entries = await Promise.all(
        initialEmployers.map(async (employer) => {
          try {
            const response = await GetEmployerReviewSummary(employer.id);
            return [employer.id, response.data] as const;
          } catch {
            return [employer.id, { averageRating: 0, reviewCount: 0 }] as const;
          }
        })
      );

      setReviewSummaries(Object.fromEntries(entries));
    };

    void loadSummaries();
  }, [authStatus, initialEmployers]);

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.text}>
        <h2 className="text-[30px] font-bold">{t("employers.title")}</h2>
        <p className="font-medium text-gray">
          {t("employers.subtitle")}
        </p>
      </div>

      <div className={styles.filters}>
        <label htmlFor="employerCityFilter">{t("employers.filterByCity")}</label>
        <select
          id="employerCityFilter"
          className={styles.cityFilterSelect}
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
        >
          <option value="">{t("employers.allCities")}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {employers.length === 0 ? (
        <div className="text-center py-6">
          {selectedCity ? t("employers.noEmployersInCity") : t("employers.noEmployers")}
        </div>
      ) : (
        <div ref={sliderRef} className="keen-slider px-2 py-4">
          {employers.map((employer: Employer) => {
            return (
              <div
                className={`keen-slider__slide ${styles["employer-card"]}`}
                key={employer.id}
              >
                {canViewProfile ? (
                  <Link to={`/employers/${employer.id}`} className={styles.cardLink}>
                    <img
                      src={getImageUrl(employer.profilePhoto)}
                      alt={employer.name}
                      className={styles["employer-img"]}
                    />
                  </Link>
                ) : (
                  <img
                    src={getImageUrl(employer.profilePhoto)}
                    alt={employer.name}
                    className={styles["employer-img"]}
                  />
                )}
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
                <div className={styles.cardFooter}>
                  {canViewProfile ? (
                    <Link to={`/employers/${employer.id}`} className={styles.employerNameLink}>
                      <p className={styles.employerName}>{employer.name}</p>
                    </Link>
                  ) : (
                    <p className={styles.employerName}>{employer.name}</p>
                  )}
                  {authStatus === "authenticated" && reviewSummaries[employer.id] && (
                    <RatingBadge
                      averageRating={reviewSummaries[employer.id].averageRating}
                      reviewCount={reviewSummaries[employer.id].reviewCount}
                      compact
                      subjectType="employer"
                      subjectId={employer.id}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployersList;
