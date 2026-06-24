import { useEmployers } from "../../hooks/useEmployers";
import LoadingContext from "../../store/Loading-context";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./EmployersList.module.scss";
import { Employer } from "../../models/User.model";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getRestaurantProfilePath } from "../../helpers/restaurantPaths";
import { GetEmployerCities, PatchClientFavorite } from "../../services/user-service";
import { GetEmployerReviewSummary } from "../../services/review-service";
import { AuthContext } from "../../store/Auth-context";
import { useTranslation } from "react-i18next";
import RatingBadge from "../Reviews/RatingBadge";
import { ReviewSummary } from "../../models/Review.model";
import LazyLoadSentinel from "../Common/LazyLoadSentinel";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useLazyLoadList } from "../../hooks/useLazyLoadList";

type EmployersListProps = {
  variant?: "carousel" | "page";
};

const EmployersList = ({ variant = "carousel" }: EmployersListProps) => {
  const { t } = useTranslation();
  const { isLoading } = useContext(LoadingContext);
  const { authStatus, role, me } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const { employers: initialEmployers, error } = useEmployers(selectedCity || undefined);
  const [employers, setEmployers] = useState(initialEmployers);
  const [reviewSummaries, setReviewSummaries] = useState<Record<string, ReviewSummary>>({});
  const canToggleFavourite = authStatus === "authenticated" && role === "Employee";
  const canViewProfile =
    authStatus === "authenticated" && (role === "Employee" || role === "Employer");
  const isPageLayout = variant === "page";

  const getEmployerProfilePath = (employer: Employer) =>
    getRestaurantProfilePath(employer, {
      myId: me && "id" in me ? String(me.id) : undefined,
      role: role ?? undefined,
    });

  const {
    visibleItems: visibleEmployers,
    hasMore,
    loadMore,
    totalCount,
    visibleCount,
  } = useLazyLoadList(
    employers,
    isPageLayout ? LIST_PAGE_SIZE : employers.length || LIST_PAGE_SIZE,
    `${selectedCity}-${isPageLayout}`
  );

  const displayedEmployers = isPageLayout ? visibleEmployers : employers;

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
    disabled: isPageLayout,
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
    event.preventDefault();
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

  const renderRatingBadge = (employer: Employer) => {
    if (authStatus !== "authenticated" || !reviewSummaries[employer.id]) {
      return null;
    }

    return (
      <RatingBadge
        averageRating={reviewSummaries[employer.id].averageRating}
        reviewCount={reviewSummaries[employer.id].reviewCount}
        compact
        subjectType="employer"
        subjectSlug={employer.publicSlug?.trim() || undefined}
        subjectId={employer.id}
      />
    );
  };

  const renderEmployerCard = (employer: Employer, cardClassName: string) => {
    const profilePath = getEmployerProfilePath(employer);

    if (canViewProfile && isPageLayout) {
      return (
        <article className={cardClassName} key={employer.id}>
          <Link to={profilePath} className={styles.pageCardProfileLink}>
            <div className={styles.photoWrapper}>
              <img
                src={getImageUrl(employer.profilePhoto)}
                alt={employer.name}
                className={styles["employer-img"]}
              />
            </div>
            <p className={styles.employerName}>{employer.name}</p>
          </Link>
          <div className={styles.cardFooter}>{renderRatingBadge(employer)}</div>
        </article>
      );
    }

    const cardBody = (
      <>
        <div className={styles.photoWrapper}>
          {canViewProfile ? (
            isPageLayout ? (
              <img
                src={getImageUrl(employer.profilePhoto)}
                alt={employer.name}
                className={styles["employer-img"]}
              />
            ) : (
              <Link to={profilePath} className={styles.cardLink}>
                <img
                  src={getImageUrl(employer.profilePhoto)}
                  alt={employer.name}
                  className={styles["employer-img"]}
                />
              </Link>
            )
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
              onClick={(e) => void handleChangeFavourite(employer, e)}
            >
              {employer.isFavourite ? "★" : "☆"}
            </button>
          )}
        </div>
        <div className={styles.cardFooter}>
          {canViewProfile && !isPageLayout ? (
            <Link to={profilePath} className={styles.employerNameLink}>
              <p className={styles.employerName}>{employer.name}</p>
            </Link>
          ) : (
            <p className={styles.employerName}>{employer.name}</p>
          )}
          {renderRatingBadge(employer)}
        </div>
      </>
    );

    return (
      <div className={cardClassName} key={employer.id}>
        {cardBody}
      </div>
    );
  };

  if (isLoading) return <div className="text-center py-6">{t("common.loading")}</div>;
  if (error)
    return <div className="text-center py-6 text-red-600">{error}</div>;

  return (
    <div className={`${styles.wrapper} ${isPageLayout ? styles.pageWrapper : ""}`}>
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
      ) : isPageLayout ? (
        <>
          <div className={styles.pageGrid}>
            {displayedEmployers.map((employer: Employer) =>
              renderEmployerCard(employer, styles.pageCard)
            )}
          </div>
          <LazyLoadSentinel
            hasMore={hasMore}
            onLoadMore={loadMore}
            visibleCount={visibleCount}
            totalCount={totalCount}
          />
        </>
      ) : (
        <div ref={sliderRef} className="keen-slider px-2 py-4">
          {displayedEmployers.map((employer: Employer) =>
            renderEmployerCard(employer, `keen-slider__slide ${styles["employer-card"]}`)
          )}
        </div>
      )}
    </div>
  );
};

export default EmployersList;
